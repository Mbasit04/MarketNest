using System.ComponentModel.DataAnnotations;

namespace MarketNest.Models;

public class Category
{
    public int Id { get; set; }

    [Required, MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(160)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImagePath { get; set; }

    public int? ParentId { get; set; }
    public Category? Parent { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public decimal Discount { get; set; } = 0m; // percentage 0-100
    public int StockQuantity { get; set; }

    [MaxLength(60)]
    public string SKU { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Brand { get; set; } = string.Empty;

    public double Weight { get; set; } = 0;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public int ShopId { get; set; }
    public Shop? Shop { get; set; }

    public ProductApproval ApprovalStatus { get; set; } = ProductApproval.Approved; // FYP: auto-approve, but flag for admin moderation
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public enum ProductApproval
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

public class ProductImage
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }
}

public class Review
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int CustomerId { get; set; }
    public User? Customer { get; set; }

    public int Rating { get; set; } // 1..5
    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}