using System.ComponentModel.DataAnnotations;

namespace MarketNest.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(160), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = UserRoles.Customer; // Admin | Seller | Customer

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    // Seller-specific
    public Shop? Shop { get; set; }
    public ICollection<SellerApplication> SellerApplications { get; set; } = new List<SellerApplication>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public static class UserRoles
{
    public const string Admin = "Admin";
    public const string Seller = "Seller";
    public const string Customer = "Customer";
}