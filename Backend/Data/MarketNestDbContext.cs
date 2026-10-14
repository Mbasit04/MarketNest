using MarketNest.Models;
using Microsoft.EntityFrameworkCore;

namespace MarketNest.Data;

public class MarketNestDbContext : DbContext
{
    public MarketNestDbContext(DbContextOptions<MarketNestDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<ShopDocument> ShopDocuments => Set<ShopDocument>();
    public DbSet<SellerApplication> SellerApplications => Set<SellerApplication>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<SellerOrder> SellerOrders => Set<SellerOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Shipping> Shippings => Set<Shipping>();
    public DbSet<CommissionSetting> CommissionSettings => Set<CommissionSetting>();
    public DbSet<SellerCommission> SellerCommissions => Set<SellerCommission>();
    public DbSet<SellerPayout> SellerPayouts => Set<SellerPayout>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Refund> Refunds => Set<Refund>();
    public DbSet<Deal> Deals => Set<Deal>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // ---------- User ----------
        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ---------- Shop ----------
        b.Entity<Shop>(e =>
        {
            e.HasOne(x => x.Owner).WithOne(u => u.Shop).HasForeignKey<Shop>(x => x.OwnerUserId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        b.Entity<ShopDocument>(e =>
        {
            e.HasOne(x => x.Shop).WithMany(s => s.Documents).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<SellerApplication>(e =>
        {
            e.HasOne(x => x.User).WithMany(u => u.SellerApplications).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            // SQL Server cannot have multiple cascade paths from User → SellerApplication
            // (User cascades directly, and through Shop). Use Restrict and let the app handle it.
            e.HasOne(x => x.Shop).WithMany().HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- Catalog ----------
        b.Entity<Category>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            // SQL Server rejects ON DELETE SET NULL on a self-referencing FK
            // (cascade cycle). The app is responsible for managing the category tree.
            e.HasOne(x => x.Parent).WithMany().HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Product>(e =>
        {
            e.HasOne(x => x.Shop).WithMany(s => s.Products).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Category).WithMany(c => c.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.Price).HasColumnType("decimal(18,2)");
            e.Property(x => x.Discount).HasColumnType("decimal(5,2)");
        });

        b.Entity<ProductImage>(e =>
        {
            e.HasOne(x => x.Product).WithMany(p => p.Images).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Review>(e =>
        {
            e.HasOne(x => x.Product).WithMany(p => p.Reviews).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- Cart ----------
        b.Entity<Cart>(e =>
        {
            e.HasIndex(x => x.CustomerId).IsUnique();
            e.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<CartItem>(e =>
        {
            e.HasOne(x => x.Cart).WithMany(c => c.Items).HasForeignKey(x => x.CartId).OnDelete(DeleteBehavior.Cascade);
            // SQL Server cannot have multiple cascade paths from User → CartItems
            // (User cascades via Cart, AND via Shop -> Product). Use Restrict here.
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- Order ----------
        b.Entity<Order>(e =>
        {
            e.HasIndex(x => x.OrderNumber).IsUnique();
            e.HasOne(x => x.Customer).WithMany(u => u.Orders).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            e.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            e.Property(x => x.ShippingFee).HasColumnType("decimal(18,2)");
            e.Property(x => x.Total).HasColumnType("decimal(18,2)");
        });

        b.Entity<SellerOrder>(e =>
        {
            e.HasIndex(x => x.SellerOrderNumber).IsUnique();
            e.HasOne(x => x.Order).WithMany(o => o.SellerOrders).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Shop).WithMany(s => s.SellerOrders).HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Restrict);
            e.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            e.Property(x => x.ShippingFee).HasColumnType("decimal(18,2)");
            e.Property(x => x.CommissionAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.SellerEarning).HasColumnType("decimal(18,2)");
            e.Property(x => x.Total).HasColumnType("decimal(18,2)");
        });

        b.Entity<OrderItem>(e =>
        {
            e.HasOne(x => x.SellerOrder).WithMany(so => so.Items).HasForeignKey(x => x.SellerOrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.LineTotal).HasColumnType("decimal(18,2)");
        });

        b.Entity<Shipping>(e =>
        {
            e.HasOne(x => x.SellerOrder).WithMany().HasForeignKey(x => x.SellerOrderId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- Finance ----------
        b.Entity<CommissionSetting>(e =>
        {
            e.Property(x => x.Percentage).HasColumnType("decimal(5,2)");
        });

        b.Entity<SellerCommission>(e =>
        {
            e.HasOne(x => x.SellerOrder).WithMany().HasForeignKey(x => x.SellerOrderId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.PercentageApplied).HasColumnType("decimal(5,2)");
            e.Property(x => x.CommissionAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.SellerEarning).HasColumnType("decimal(18,2)");
        });

        b.Entity<SellerPayout>(e =>
        {
            e.HasOne(x => x.Shop).WithMany().HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        });

        b.Entity<Transaction>(e =>
        {
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.Property(x => x.BalanceAfter).HasColumnType("decimal(18,2)");
        });

        b.Entity<Refund>(e =>
        {
            e.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        });

        b.Entity<Deal>(e => { e.Property(x => x.DiscountPercent).HasColumnType("decimal(5,2)"); });
    }
}