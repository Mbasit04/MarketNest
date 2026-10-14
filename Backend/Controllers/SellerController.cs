using MarketNest.Data;
using MarketNest.Models;
using MarketNest.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketNest.Controllers;

[ApiController]
[Route("api/seller")]
public class SellerController : ControllerBase
{
    private readonly MarketNestDbContext _db;
    public SellerController(MarketNestDbContext db) { _db = db; }

    private User CurrentUser =>
        _db.Users.First(u => u.Id == int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value));

    private Shop? CurrentShop =>
        _db.Shops.FirstOrDefault(s => s.OwnerUserId == CurrentUser.Id);

    // ---------- Seller application ----------
    [HttpPost("apply")]
    [AllowAnonymous] // allow any authenticated user (Customer) to apply to become a seller
    public async Task<ActionResult> Apply([FromBody] SellerApplyRequest req)
    {
        var user = CurrentUser;
        if (user.Role == UserRoles.Seller)
            return BadRequest(new ApiError { Error = "You are already a seller" });
        if (user.Role == UserRoles.Admin)
            return BadRequest(new ApiError { Error = "Admins cannot apply as seller" });

        // Validate license dates
        if (req.LicenseExpiryDate <= req.LicenseIssueDate)
            return BadRequest(new ApiError { Error = "License expiry date must be after issue date" });
        if (req.LicenseExpiryDate <= DateTime.UtcNow)
            return BadRequest(new ApiError { Error = "License is already expired" });

        var shop = new Shop
        {
            OwnerUserId = user.Id,
            ShopName = req.ShopName,
            Description = req.Description,
            Address = req.Address,
            City = req.City,
            ShopPhone = req.ShopPhone,
            ShopCategory = req.ShopCategory,
            LicenseNumber = req.LicenseNumber,
            LicenseIssueDate = req.LicenseIssueDate,
            LicenseExpiryDate = req.LicenseExpiryDate,
            IssuingAuthority = req.IssuingAuthority,
            BankName = req.BankName,
            BankAccountTitle = req.BankAccountTitle,
            BankAccountNumber = req.BankAccountNumber,
            Status = ShopStatus.PendingVerification
        };
        _db.Shops.Add(shop);
        await _db.SaveChangesAsync();

        user.Role = UserRoles.Seller;
        _db.SellerApplications.Add(new SellerApplication
        {
            UserId = user.Id,
            ShopId = shop.Id,
            Status = ApplicationStatus.Pending
        });
        await _db.SaveChangesAsync();

        return Ok(new { message = "Application submitted. Admin will review shortly.", shopId = shop.Id, status = shop.Status.ToString() });
    }

    [HttpGet("me")]
    public async Task<ActionResult> Me()
    {
        var user = CurrentUser;
        var shop = CurrentShop;
        var pendingDocs = shop == null ? 0 : await _db.ShopDocuments.CountAsync(d => d.ShopId == shop.Id);
        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            Shop = shop,
            PendingDocuments = pendingDocs
        });
    }

    // ---------- Documents ----------
    [HttpPost("documents")]
    public async Task<ActionResult> AddDocument([FromBody] ShopDocument doc)
    {
        var shop = CurrentShop;
        if (shop is null) return BadRequest(new ApiError { Error = "No shop associated" });
        doc.ShopId = shop.Id;
        _db.ShopDocuments.Add(doc);
        await _db.SaveChangesAsync();
        return Ok(doc);
    }

    [HttpGet("documents")]
    public async Task<ActionResult> Documents()
    {
        var shop = CurrentShop;
        if (shop is null) return Ok(Array.Empty<ShopDocument>());
        return Ok(await _db.ShopDocuments.Where(d => d.ShopId == shop.Id).ToListAsync());
    }

    // ---------- Products ----------
    [HttpPost("products")]
    public async Task<ActionResult> AddProduct([FromBody] ProductRequest req)
    {
        var shop = CurrentShop;
        if (shop is null) return BadRequest(new ApiError { Error = "No shop associated" });
        if (shop.Status != ShopStatus.Approved)
            return BadRequest(new ApiError { Error = "Your shop is not approved yet" });

        var p = new Product
        {
            Name = req.Name,
            Description = req.Description,
            Price = req.Price,
            Discount = req.Discount,
            StockQuantity = req.StockQuantity,
            SKU = req.SKU,
            Brand = req.Brand,
            Weight = req.Weight,
            CategoryId = req.CategoryId,
            ShopId = shop.Id
        };
        _db.Products.Add(p);
        await _db.SaveChangesAsync();

        if (req.ImagePaths != null)
        {
            foreach (var (path, idx) in req.ImagePaths.Select((p, i) => (p, i)))
            {
                _db.ProductImages.Add(new ProductImage { ProductId = p.Id, FilePath = path, IsPrimary = idx == 0 });
            }
            await _db.SaveChangesAsync();
        }

        return Ok(p);
    }

    [HttpGet("products")]
    public async Task<ActionResult> MyProducts()
    {
        var shop = CurrentShop;
        if (shop is null) return Ok(Array.Empty<Product>());
        var products = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Where(p => p.ShopId == shop.Id)
            .OrderByDescending(p => p.Id)
            .ToListAsync();
        return Ok(products);
    }

    [HttpPut("products/{id}")]
    public async Task<ActionResult> UpdateProduct(int id, [FromBody] ProductRequest req)
    {
        var shop = CurrentShop;
        if (shop is null) return BadRequest(new ApiError { Error = "No shop associated" });
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id && x.ShopId == shop.Id);
        if (p is null) return NotFound();

        p.Name = req.Name; p.Description = req.Description; p.Price = req.Price;
        p.Discount = req.Discount; p.StockQuantity = req.StockQuantity;
        p.SKU = req.SKU; p.Brand = req.Brand; p.Weight = req.Weight;
        p.CategoryId = req.CategoryId;
        await _db.SaveChangesAsync();
        return Ok(p);
    }

    [HttpDelete("products/{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var shop = CurrentShop;
        if (shop is null) return BadRequest(new ApiError { Error = "No shop associated" });
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id && x.ShopId == shop.Id);
        if (p is null) return NotFound();
        _db.Products.Remove(p);
        await _db.SaveChangesAsync();
        return Ok(new { deleted = true });
    }

    // ---------- Orders (seller view) ----------
    [HttpGet("orders")]
    public async Task<ActionResult> MySellerOrders([FromQuery] string? status)
    {
        var shop = CurrentShop;
        if (shop is null) return Ok(Array.Empty<SellerOrder>());

        var q = _db.SellerOrders
            .Include(o => o.Order)
            .Include(o => o.Items)
            .Where(o => o.ShopId == shop.Id);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var s))
            q = q.Where(o => o.Status == s);

        var list = await q.OrderByDescending(o => o.Id).ToListAsync();
        return Ok(list);
    }

    public class UpdateStatusRequest
    {
        public OrderStatus Status { get; set; }
        public string? TrackingNumber { get; set; }
    }

    [HttpPut("orders/{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
    {
        var shop = CurrentShop;
        if (shop is null) return BadRequest(new ApiError { Error = "No shop associated" });
        var so = await _db.SellerOrders.FirstOrDefaultAsync(o => o.Id == id && o.ShopId == shop.Id);
        if (so is null) return NotFound();

        so.Status = req.Status;
        if (!string.IsNullOrWhiteSpace(req.TrackingNumber))
            so.TrackingNumber = req.TrackingNumber;

        if (req.Status == OrderStatus.Shipped) so.ShippedAt = DateTime.UtcNow;
        if (req.Status == OrderStatus.Delivered) so.DeliveredAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // mirror to parent order
        var parent = await _db.Orders.Include(o => o.SellerOrders).FirstAsync(o => o.Id == so.OrderId);
        if (parent.SellerOrders.All(s => s.Status == OrderStatus.Delivered || s.Status == OrderStatus.Completed))
            parent.Status = OrderStatus.Completed;

        await _db.SaveChangesAsync();
        return Ok(so);
    }

    // ---------- Dashboard summary ----------
    [HttpGet("dashboard")]
    public async Task<ActionResult> Dashboard()
    {
        var shop = CurrentShop;
        if (shop is null) return Ok(new { hasShop = false });

        var sellerOrders = _db.SellerOrders.Where(o => o.ShopId == shop.Id);
        var totalSales = await sellerOrders.SumAsync(o => (decimal?)o.Subtotal) ?? 0;
        var commission = await sellerOrders.SumAsync(o => (decimal?)o.CommissionAmount) ?? 0;
        var earnings = await sellerOrders.SumAsync(o => (decimal?)o.SellerEarning) ?? 0;
        var orderCount = await sellerOrders.CountAsync();
        var productCount = await _db.Products.CountAsync(p => p.ShopId == shop.Id);
        var pendingOrders = await sellerOrders.CountAsync(o => o.Status == OrderStatus.Confirmed || o.Status == OrderStatus.Processing);

        return Ok(new
        {
            hasShop = true,
            shopId = shop.Id,
            shopName = shop.ShopName,
            status = shop.Status.ToString(),
            totalSales,
            commission,
            earnings,
            orderCount,
            productCount,
            pendingOrders
        });
    }
}