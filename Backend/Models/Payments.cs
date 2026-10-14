using System.ComponentModel.DataAnnotations;

namespace MarketNest.Models;

public class CommissionSetting
{
    public int Id { get; set; }
    public decimal Percentage { get; set; } = 10m;
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    [MaxLength(200)]
    public string? Notes { get; set; }

    public int? CreatedByAdminId { get; set; }
}

public class SellerCommission
{
    public int Id { get; set; }
    public int SellerOrderId { get; set; }
    public SellerOrder? SellerOrder { get; set; }

    public decimal PercentageApplied { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal SellerEarning { get; set; }
}

public class SellerPayout
{
    public int Id { get; set; }
    public int ShopId { get; set; }
    public Shop? Shop { get; set; }

    public decimal Amount { get; set; }
    public PayoutStatus Status { get; set; } = PayoutStatus.Requested;

    [MaxLength(200)]
    public string? Reference { get; set; }

    [MaxLength(400)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
}

public enum PayoutStatus
{
    Requested = 0,
    Approved = 1,
    Paid = 2,
    Cancelled = 3
}

public class Transaction
{
    public int Id { get; set; }

    public int? OrderId { get; set; }
    public int? ShopId { get; set; }
    public int? PayoutId { get; set; }

    [MaxLength(40)]
    public string Type { get; set; } = string.Empty; // Sale, Commission, Refund, Payout

    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Refund
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public decimal Amount { get; set; }
    [MaxLength(400)]
    public string Reason { get; set; } = string.Empty;

    public RefundStatus Status { get; set; } = RefundStatus.Requested;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}

public enum RefundStatus
{
    Requested = 0,
    Approved = 1,
    Rejected = 2,
    Processed = 3
}

public class Deal
{
    public int Id { get; set; }
    [MaxLength(160)]
    public string Title { get; set; } = string.Empty;
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public decimal DiscountPercent { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    [MaxLength(160)]
    public string Title { get; set; } = string.Empty;
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}