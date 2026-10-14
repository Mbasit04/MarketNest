using MarketNest.Data;
using MarketNest.Models;
using Microsoft.EntityFrameworkCore;

namespace MarketNest.Services;

public interface IOrderService
{
    Task<(Order order, List<SellerOrder> sellerOrders)> PlaceOrderAsync(User customer, CheckoutRequest req);
    string NextOrderNumber();
    string NextSellerOrderNumber(int orderId, int sellerIndex);
}

public class OrderService : IOrderService
{
    private readonly MarketNestDbContext _db;
    private readonly ICommissionService _commission;

    public OrderService(MarketNestDbContext db, ICommissionService commission)
    {
        _db = db;
        _commission = commission;
    }

    public string NextOrderNumber()
    {
        // Simple sequential number prefixed with MN; for FYP scope this is fine.
        var lastId = _db.Orders.Any() ? _db.Orders.Max(o => o.Id) : 0;
        return $"MN{(10000 + lastId + 1)}";
    }

    public string NextSellerOrderNumber(int orderId, int sellerIndex)
    {
        return $"MN{10000 + orderId}-{(char)('A' + sellerIndex)}";
    }

    public async Task<(Order order, List<SellerOrder> sellerOrders)> PlaceOrderAsync(User customer, CheckoutRequest req)
    {
        var cart = await _db.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .ThenInclude(p => p.Shop)
            .FirstOrDefaultAsync(c => c.CustomerId == customer.Id)
            ?? throw new InvalidOperationException("Cart is empty.");

        var items = cart.Items.Where(i => i.Quantity > 0).ToList();
        if (items.Count == 0) throw new InvalidOperationException("Cart is empty.");

        // Group items by shop for multi-vendor split
        var groups = items.GroupBy(i => i.Product!.ShopId).ToList();
        var percent = await _commission.GetActivePercentageAsync();

        var order = new Order
        {
            OrderNumber = NextOrderNumber(),
            CustomerId = customer.Id,
            ShippingAddress = req.ShippingAddress,
            ShippingCity = req.ShippingCity,
            ShippingPhone = req.ShippingPhone,
            PaymentMethod = req.PaymentMethod,
            PaymentReference = req.PaymentReference,
            PaymentStatus = req.PaymentMethod == PaymentMethod.COD ? PaymentStatus.Pending : PaymentStatus.Paid,
            Status = OrderStatus.Pending,
            Subtotal = 0, ShippingFee = 0, Total = 0
        };

        if (req.PaymentMethod == PaymentMethod.COD)
        {
            order.Status = OrderStatus.Confirmed;
            order.ConfirmedAt = DateTime.UtcNow;
        }
        else
        {
            order.Status = OrderStatus.Confirmed;
            order.ConfirmedAt = DateTime.UtcNow;
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(); // get generated id

        decimal grandSubtotal = 0;
        decimal grandTotal = 0;
        var sellerOrders = new List<SellerOrder>();
        var sellerIndex = 0;

        foreach (var group in groups)
        {
            var shopId = group.Key;
            decimal sub = 0m;
            var so = new SellerOrder
            {
                OrderId = order.Id,
                ShopId = shopId,
                SellerOrderNumber = NextSellerOrderNumber(order.Id, sellerIndex++),
                Status = OrderStatus.Confirmed
            };

            foreach (var ci in group)
            {
                var product = ci.Product!;
                if (!product.IsActive)
                    throw new InvalidOperationException($"Product {product.Name} is unavailable.");

                var unit = product.Price * (1 - product.Discount / 100m);
                var line = Math.Round(unit * ci.Quantity, 2);
                sub += line;

                so.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = Math.Round(unit, 2),
                    Quantity = ci.Quantity,
                    LineTotal = line
                });

                // decrement stock
                product.StockQuantity = Math.Max(0, product.StockQuantity - ci.Quantity);
            }

            so.Subtotal = sub;
            so.ShippingFee = 250m; // flat per-seller shipping in this FYP
            var (commission, earning) = _commission.Calculate(sub, percent);
            so.CommissionAmount = commission;
            so.SellerEarning = earning;
            so.Total = sub + so.ShippingFee;

            _db.SellerOrders.Add(so);
            sellerOrders.Add(so);
            grandSubtotal += sub;
            grandTotal += so.Total;
        }

        order.Subtotal = grandSubtotal;
        order.ShippingFee = sellerOrders.Sum(s => s.ShippingFee);
        order.Total = grandTotal;
        await _db.SaveChangesAsync();

        // Clear cart
        _db.CartItems.RemoveRange(cart.Items);
        await _db.SaveChangesAsync();

        return (order, sellerOrders);
    }
}