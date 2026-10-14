using MarketNest.Data;
using MarketNest.Models;
using MarketNest.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketNest.Controllers;

[ApiController]
[Route("api/customer")]
[Authorize(Roles = UserRoles.Customer)]
public class CustomerController : ControllerBase
{
    private readonly MarketNestDbContext _db;
    private readonly IOrderService _orderService;

    public CustomerController(MarketNestDbContext db, IOrderService orderService)
    {
        _db = db; _orderService = orderService;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    private async Task<Cart> GetOrCreateCart()
    {
        var cart = await _db.Carts.Include(c => c.Items)
            .ThenInclude(i => i.Product).ThenInclude(p => p!.Shop)
            .FirstOrDefaultAsync(c => c.CustomerId == CurrentUserId);
        if (cart is null)
        {
            cart = new Cart { CustomerId = CurrentUserId };
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();
        }
        return cart;
    }

    // ---------- Cart ----------
    [HttpGet("cart")]
    public async Task<ActionResult> GetCart()
    {
        var cart = await GetOrCreateCart();
        // Group by seller for clean UI
        var grouped = cart.Items.Select(i => new
        {
            i.Id,
            i.ProductId,
            ProductName = i.Product!.Name,
            UnitPrice = i.Product!.Price * (1 - i.Product.Discount / 100m),
            i.Quantity,
            LineTotal = i.Quantity * i.Product!.Price * (1 - i.Product.Discount / 100m),
            Stock = i.Product!.StockQuantity,
            ShopId = i.Product!.ShopId,
            ShopName = i.Product!.Shop!.ShopName,
            Image = _db.ProductImages.Where(img => img.ProductId == i.ProductId && img.IsPrimary)
                .Select(img => img.FilePath).FirstOrDefault()
        }).ToList();

        var byShop = grouped.GroupBy(g => new { g.ShopId, g.ShopName }).Select(g => new
        {
            g.Key.ShopId,
            g.Key.ShopName,
            Items = g.ToList(),
            Subtotal = g.Sum(x => x.LineTotal)
        });

        return Ok(new
        {
            cartId = cart.Id,
            items = grouped,
            byShop,
            cartTotal = grouped.Sum(i => i.LineTotal)
        });
    }

    [HttpPost("cart/add")]
    public async Task<ActionResult> AddToCart([FromBody] CartAddRequest req)
    {
        if (req.Quantity <= 0) return BadRequest(new ApiError { Error = "Invalid quantity" });
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == req.ProductId && p.IsActive);
        if (product is null) return NotFound(new ApiError { Error = "Product unavailable" });

        var cart = await GetOrCreateCart();
        var existing = cart.Items.FirstOrDefault(i => i.ProductId == req.ProductId);
        if (existing is null)
        {
            cart.Items.Add(new CartItem { ProductId = req.ProductId, Quantity = req.Quantity });
        }
        else
        {
            existing.Quantity += req.Quantity;
        }
        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { added = true });
    }

    [HttpPut("cart/items/{id}")]
    public async Task<IActionResult> UpdateQty(int id, [FromBody] CartAddRequest req)
    {
        var cart = await GetOrCreateCart();
        var item = cart.Items.FirstOrDefault(i => i.Id == id);
        if (item is null) return NotFound();
        if (req.Quantity <= 0) cart.Items.Remove(item);
        else item.Quantity = req.Quantity;
        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("cart/items/{id}")]
    public async Task<IActionResult> RemoveItem(int id)
    {
        var cart = await GetOrCreateCart();
        var item = cart.Items.FirstOrDefault(i => i.Id == id);
        if (item is null) return NotFound();
        cart.Items.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("cart")]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await GetOrCreateCart();
        _db.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // ---------- Checkout ----------
    [HttpPost("checkout")]
    public async Task<ActionResult> Checkout([FromBody] CheckoutRequest req)
    {
        var user = await _db.Users.FirstAsync(u => u.Id == CurrentUserId);
        try
        {
            var (order, sellerOrders) = await _orderService.PlaceOrderAsync(user, req);
            return Ok(new
            {
                order.Id,
                order.OrderNumber,
                order.Total,
                order.Status,
                order.PaymentStatus,
                order.PaymentMethod,
                SellerOrders = sellerOrders
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiError { Error = ex.Message });
        }
    }

    // ---------- Orders ----------
    [HttpGet("orders")]
    public async Task<ActionResult> MyOrders()
    {
        var orders = await _db.Orders
            .Include(o => o.SellerOrders).ThenInclude(s => s.Items)
            .Include(o => o.SellerOrders).ThenInclude(s => s.Shop)
            .Where(o => o.CustomerId == CurrentUserId)
            .OrderByDescending(o => o.Id)
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("orders/{id}")]
    public async Task<ActionResult> OrderDetail(int id)
    {
        var o = await _db.Orders
            .Include(x => x.SellerOrders).ThenInclude(s => s.Items)
            .Include(x => x.SellerOrders).ThenInclude(s => s.Shop)
            .FirstOrDefaultAsync(x => x.Id == id && x.CustomerId == CurrentUserId);
        return o is null ? NotFound() : Ok(o);
    }

    [HttpPost("orders/{id}/cancel")]
    public async Task<ActionResult> CancelOrder(int id)
    {
        var order = await _db.Orders.Include(o => o.SellerOrders)
            .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == CurrentUserId);
        if (order is null) return NotFound();
        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            return BadRequest(new ApiError { Error = "Order can no longer be cancelled" });

        order.Status = OrderStatus.Cancelled;
        foreach (var so in order.SellerOrders) so.Status = OrderStatus.Cancelled;
        await _db.SaveChangesAsync();
        return Ok(order);
    }

    // ---------- Reviews ----------
    [HttpPost("reviews")]
    public async Task<ActionResult> AddReview([FromBody] Review review)
    {
        review.CustomerId = CurrentUserId;
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();
        return Ok(review);
    }
}