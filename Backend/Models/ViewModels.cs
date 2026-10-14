using System.ComponentModel.DataAnnotations;

namespace MarketNest.Models;

// --- DTOs used by API ---

public class RegisterRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? ShopId { get; set; }
    public string? ShopStatus { get; set; }
}

public class SellerApplyRequest
{
    [Required] public string ShopName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    [Required] public string Address { get; set; } = string.Empty;
    [Required] public string City { get; set; } = string.Empty;
    [Required] public string ShopPhone { get; set; } = string.Empty;
    [Required] public string ShopCategory { get; set; } = string.Empty;
    [Required] public string LicenseNumber { get; set; } = string.Empty;
    [Required] public DateTime LicenseIssueDate { get; set; }
    [Required] public DateTime LicenseExpiryDate { get; set; }
    [Required] public string IssuingAuthority { get; set; } = string.Empty;
    public string? BankName { get; set; }
    public string? BankAccountTitle { get; set; }
    public string? BankAccountNumber { get; set; }
}

public class AdminSellerReviewRequest
{
    public bool Approve { get; set; }
    public string? RejectionReason { get; set; }
}

public class CategoryRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentId { get; set; }
}

public class ProductRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    [Required] public decimal Price { get; set; }
    public decimal Discount { get; set; }
    [Required] public int StockQuantity { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public double Weight { get; set; }
    [Required] public int CategoryId { get; set; }
    public List<string>? ImagePaths { get; set; }
}

public class CartAddRequest
{
    [Required] public int ProductId { get; set; }
    [Required] public int Quantity { get; set; } = 1;
}

public class CheckoutRequest
{
    [Required] public string ShippingAddress { get; set; } = string.Empty;
    [Required] public string ShippingCity { get; set; } = string.Empty;
    [Required] public string ShippingPhone { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;
    public string? PaymentReference { get; set; }
}

public class SellerOrderStatusRequest
{
    public OrderStatus Status { get; set; }
    public string? TrackingNumber { get; set; }
}

public class CommissionSettingRequest
{
    [Required] public decimal Percentage { get; set; }
    public string? Notes { get; set; }
}

public class ApiError
{
    public string Error { get; set; } = string.Empty;
    public string? Detail { get; set; }
}