using System.ComponentModel.DataAnnotations;

namespace MarketNest.Models;

// Order = the customer-facing order that may span multiple sellers.
// SellerOrder = per-seller sub-order that handles commission, shipping, payout.
public class Order
{
    public int Id { get; set; }

    [MaxLength(40)]
    public string OrderNumber { get; set; } = string.Empty; // e.g. MN10001

    public int CustomerId { get; set; }
    public User? Customer { get; set; }

    [MaxLength(200)]
    public string ShippingAddress { get; set; } = string.Empty;

    [MaxLength(80)]
    public string ShippingCity { get; set; } = string.Empty;

    [MaxLength(40)]
    public string ShippingPhone { get; set; } = string.Empty;

    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal Total { get; set; }

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;

    [MaxLength(200)]
    public string? PaymentReference { get; set; } // Stripe Intent / Transaction

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    public ICollection<SellerOrder> SellerOrders { get; set; } = new List<SellerOrder>();
}

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Packed = 3,
    Shipped = 4,
    OutForDelivery = 5,
    Delivered = 6,
    Completed = 7,
    Cancelled = 8,
    RefundRequested = 9,
    Refunded = 10,
    Returned = 11
}

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3
}

public enum PaymentMethod
{
    COD = 0,
    Stripe = 1
}

public class SellerOrder
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public int ShopId { get; set; }
    public Shop? Shop { get; set; }

    [MaxLength(40)]
    public string SellerOrderNumber { get; set; } = string.Empty; // e.g. MN10001-A

    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal SellerEarning { get; set; }
    public decimal Total { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    [MaxLength(200)]
    public string? TrackingNumber { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public int Id { get; set; }

    public int SellerOrderId { get; set; }
    public SellerOrder? SellerOrder { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}

public class Shipping
{
    public int Id { get; set; }
    public int SellerOrderId { get; set; }
    public SellerOrder? SellerOrder { get; set; }

    [MaxLength(80)]
    public string Carrier { get; set; } = string.Empty;

    [MaxLength(200)]
    public string TrackingNumber { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Status { get; set; } = string.Empty;

    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}