using System.ComponentModel.DataAnnotations;

namespace MarketNest.Models;

// Status lifecycle: PendingVerification -> Approved | Rejected | Suspended | Expired
public class Shop
{
    public int Id { get; set; }

    public int OwnerUserId { get; set; }
    public User? Owner { get; set; }

    [Required, MaxLength(160)]
    public string ShopName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(80)]
    public string City { get; set; } = string.Empty;

    [MaxLength(40)]
    public string ShopPhone { get; set; } = string.Empty;

    [MaxLength(80)]
    public string ShopCategory { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ShopImagePath { get; set; }

    // License
    [MaxLength(80)]
    public string LicenseNumber { get; set; } = string.Empty;

    public DateTime LicenseIssueDate { get; set; }
    public DateTime LicenseExpiryDate { get; set; }

    [MaxLength(160)]
    public string IssuingAuthority { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? LicenseDocumentPath { get; set; }

    // Bank
    [MaxLength(80)]
    public string? BankName { get; set; }

    [MaxLength(80)]
    public string? BankAccountTitle { get; set; }

    [MaxLength(40)]
    public string? BankAccountNumber { get; set; }

    public ShopStatus Status { get; set; } = ShopStatus.PendingVerification;

    [MaxLength(500)]
    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }

    public ICollection<ShopDocument> Documents { get; set; } = new List<ShopDocument>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<SellerOrder> SellerOrders { get; set; } = new List<SellerOrder>();
}

public enum ShopStatus
{
    PendingVerification = 0,
    Approved = 1,
    Rejected = 2,
    Suspended = 3,
    Expired = 4
}

public class ShopDocument
{
    public int Id { get; set; }
    public int ShopId { get; set; }
    public Shop? Shop { get; set; }

    [Required, MaxLength(40)]
    public string DocumentType { get; set; } = string.Empty; // CNICFront, CNICBack, License, TaxCertificate, Other

    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [MaxLength(120)]
    public string OriginalFileName { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

public class SellerApplication
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    public int? ShopId { get; set; }
    public Shop? Shop { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }

    public int? ReviewedByAdminId { get; set; }
}

public enum ApplicationStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}