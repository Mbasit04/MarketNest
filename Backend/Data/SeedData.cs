using MarketNest.Models;
using MarketNest.Services;

namespace MarketNest.Data;

public static class SeedData
{
    public static async Task SeedAsync(MarketNestDbContext db, IPasswordHasher hasher)
    {
        if (db.Users.Any()) return; // already seeded

        // ---------- Users ----------
        var admin = new User
        {
            FullName = "MarketNest Admin",
            Email = "admin@marketnest.com",
            PasswordHash = hasher.Hash("Admin@123"),
            Phone = "+923001234567",
            Role = UserRoles.Admin
        };

        var ali = new User
        {
            FullName = "Ali Raza",
            Email = "ali@shop.com",
            PasswordHash = hasher.Hash("Ali@12345"),
            Phone = "+923009876541",
            Role = UserRoles.Seller
        };
        var ahmed = new User
        {
            FullName = "Ahmed Khan",
            Email = "ahmed@shop.com",
            PasswordHash = hasher.Hash("Ahmed@123"),
            Phone = "+923007777888",
            Role = UserRoles.Seller
        };
        var usman = new User
        {
            FullName = "Usman Tariq",
            Email = "usman@shop.com",
            PasswordHash = hasher.Hash("Usman@123"),
            Phone = "+923004444333",
            Role = UserRoles.Seller
        };

        var customer = new User
        {
            FullName = "Sara Customer",
            Email = "sara@buyer.com",
            PasswordHash = hasher.Hash("Sara@123"),
            Phone = "+923001112222",
            Role = UserRoles.Customer
        };

        db.Users.AddRange(admin, ali, ahmed, usman, customer);
        await db.SaveChangesAsync();

        // ---------- Shops ----------
        var aliShop = new Shop
        {
            OwnerUserId = ali.Id,
            ShopName = "Ali Electronics",
            Description = "Premium electronics and gadgets, all original brands.",
            Address = "Block 4, Clifton",
            City = "Karachi",
            ShopPhone = "+923009876541",
            ShopCategory = "Electronics",
            LicenseNumber = "LIC-ALI-001",
            LicenseIssueDate = DateTime.UtcNow.AddYears(-1),
            LicenseExpiryDate = DateTime.UtcNow.AddYears(2),
            IssuingAuthority = "Karachi Metropolitan Corporation",
            Status = ShopStatus.Approved,
            ApprovedAt = DateTime.UtcNow.AddDays(-30),
            BankName = "HBL",
            BankAccountTitle = "Ali Raza",
            BankAccountNumber = "1234567890"
        };
        var ahmedShop = new Shop
        {
            OwnerUserId = ahmed.Id,
            ShopName = "Ahmed Fashion Mart",
            Description = "Trendy clothing and shoes for men and women.",
            Address = "Mall Road",
            City = "Lahore",
            ShopPhone = "+923007777888",
            ShopCategory = "Fashion",
            LicenseNumber = "LIC-AHM-002",
            LicenseIssueDate = DateTime.UtcNow.AddYears(-2),
            LicenseExpiryDate = DateTime.UtcNow.AddMonths(6),
            IssuingAuthority = "Lahore Development Authority",
            Status = ShopStatus.Approved,
            ApprovedAt = DateTime.UtcNow.AddDays(-60)
        };
        var usmanShop = new Shop
        {
            OwnerUserId = usman.Id,
            ShopName = "Usman Watches",
            Description = "Authentic watches and accessories.",
            Address = "Saddar",
            City = "Rawalpindi",
            ShopPhone = "+923004444333",
            ShopCategory = "Accessories",
            LicenseNumber = "LIC-USM-003",
            LicenseIssueDate = DateTime.UtcNow.AddYears(-3),
            LicenseExpiryDate = DateTime.UtcNow.AddDays(-5), // expired
            IssuingAuthority = "Rawalpindi Cantonment Board",
            Status = ShopStatus.Expired,
            BankName = "UBL",
            BankAccountTitle = "Usman Tariq",
            BankAccountNumber = "9876543210"
        };

        db.Shops.AddRange(aliShop, ahmedShop, usmanShop);
        await db.SaveChangesAsync(); // get shop IDs

        // ---------- Seller Applications (1 pending for demo) ----------
        var pendingApp = new SellerApplication
        {
            UserId = usman.Id,
            ShopId = usmanShop.Id,
            Status = ApplicationStatus.Approved
        };
        db.SellerApplications.Add(pendingApp);
        await db.SaveChangesAsync();

        // ---------- Categories ----------
        var electronics = new Category { Name = "Electronics", Slug = "electronics", Description = "Phones, laptops, gadgets" };
        var fashion = new Category { Name = "Fashion", Slug = "fashion", Description = "Clothing, shoes, accessories" };
        var watches = new Category { Name = "Watches", Slug = "watches", Description = "Watches and timepieces" };
        var home = new Category { Name = "Home & Kitchen", Slug = "home-kitchen", Description = "Appliances and decor" };
        db.Categories.AddRange(electronics, fashion, watches, home);
        await db.SaveChangesAsync();

        // ---------- Products ----------
        var products = new List<Product>
        {
            new() { Name = "iPhone 15 Pro", Description = "Apple iPhone 15 Pro 256GB Titanium", Price = 459000m, Discount = 5, StockQuantity = 12, SKU = "APL-IP15P", Brand = "Apple", CategoryId = electronics.Id, ShopId = aliShop.Id },
            new() { Name = "Samsung Galaxy S24", Description = "Samsung Galaxy S24 Ultra 512GB", Price = 389000m, Discount = 8, StockQuantity = 20, SKU = "SMS-S24U", Brand = "Samsung", CategoryId = electronics.Id, ShopId = aliShop.Id },
            new() { Name = "MacBook Air M3", Description = "Apple MacBook Air 13\" M3 chip 16GB", Price = 285000m, Discount = 3, StockQuantity = 8, SKU = "APL-MBA-M3", Brand = "Apple", CategoryId = electronics.Id, ShopId = aliShop.Id },
            new() { Name = "Nike Air Max", Description = "Nike Air Max 270 Men's Running Shoes", Price = 24500m, Discount = 10, StockQuantity = 30, SKU = "NK-AM270", Brand = "Nike", CategoryId = fashion.Id, ShopId = ahmedShop.Id },
            new() { Name = "Adidas Ultraboost", Description = "Adidas Ultraboost 22 - Black", Price = 28900m, Discount = 7, StockQuantity = 25, SKU = "AD-UB22", Brand = "Adidas", CategoryId = fashion.Id, ShopId = ahmedShop.Id },
            new() { Name = "Casio G-Shock", Description = "Casio G-Shock GA-2100 Carbon Core", Price = 18500m, Discount = 0, StockQuantity = 15, SKU = "CS-GA2100", Brand = "Casio", CategoryId = watches.Id, ShopId = ahmedShop.Id },
        };
        db.Products.AddRange(products);
        await db.SaveChangesAsync();

        // ---------- Commission setting ----------
        db.CommissionSettings.Add(new CommissionSetting
        {
            Percentage = 10m,
            IsActive = true,
            EffectiveFrom = DateTime.UtcNow,
            Notes = "Default platform commission"
        });

        // ---------- Cart for demo customer ----------
        var cart = new Cart { CustomerId = customer.Id };
        db.Carts.Add(cart);
        await db.SaveChangesAsync();
        db.CartItems.Add(new CartItem { CartId = cart.Id, ProductId = products[0].Id, Quantity = 1 });
        db.CartItems.Add(new CartItem { CartId = cart.Id, ProductId = products[3].Id, Quantity = 2 });
        await db.SaveChangesAsync();
    }
}