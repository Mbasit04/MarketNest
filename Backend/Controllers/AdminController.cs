using MarketNest.Data;
using MarketNest.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketNest.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = UserRoles.Admin)]
public class AdminController : ControllerBase
{
    private readonly MarketNestDbContext _db;
    public AdminController(MarketNestDbContext db) { _db = db; }

    // ---------- Dashboard ----------
    [HttpGet("dashboard")]
    public async Task<ActionResult> Dashboard()
    {
        var totalCustomers = await _db.Users.CountAsync(u => u.Role == UserRoles.Customer);
        var totalSellers = await _db.Users.CountAsync(u => u.Role == UserRoles.Seller);
        var pendingSellers = await _db.Shops.CountAsync(s => s.Status == ShopStatus.PendingVerification);
        var activeShops = await _db.Shops.CountAsync(s => s.Status == ShopStatus.Approved);
        var totalProducts = await _db.Products.CountAsync();
        var pendingProducts = await _db.Products.CountAsync(p => p.ApprovalStatus == ProductApproval.Pending);
        var totalOrders = await _db.Orders.CountAsync();
        var totalRevenue = await _db.Orders.SumAsync(o => (decimal?)o.Total) ?? 0;
        var commission = await _db.SellerCommissions.SumAsync(c => (decimal?)c.CommissionAmount) ?? 0;

        return Ok(new
        {
            totalCustomers,
            totalSellers,
            pendingSellers,
            activeShops,
            totalProducts,
            pendingProducts,
            totalOrders,
            totalRevenue,
            commission
        });
    }

    // ---------- Seller verification ----------
    [HttpGet("sellers")]
    public async Task<ActionResult> Sellers([FromQuery] string? status)
    {
        var q = _db.Shops
            .Include(s => s.Owner)
            .Include(s => s.Documents)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ShopStatus>(status, true, out var st))
            q = q.Where(s => s.Status == st);

        var list = await q.OrderByDescending(s => s.CreatedAt).ToListAsync();
        return Ok(list.Select(s => new
        {
            s.Id,
            s.ShopName,
            s.OwnerUserId,
            OwnerName = s.Owner!.FullName,
            OwnerEmail = s.Owner!.Email,
            s.City,
            s.ShopCategory,
            s.LicenseNumber,
            s.LicenseIssueDate,
            s.LicenseExpiryDate,
            s.IssuingAuthority,
            s.Status,
            s.RejectionReason,
            s.CreatedAt,
            s.ApprovedAt,
            DocumentCount = s.Documents.Count,
            s.ShopImagePath,
            s.LicenseDocumentPath,
            s.BankName,
            s.BankAccountTitle,
            s.BankAccountNumber
        }));
    }

    [HttpGet("sellers/{id}")]
    public async Task<ActionResult> SellerDetail(int id)
    {
        var shop = await _db.Shops
            .Include(s => s.Owner)
            .Include(s => s.Documents)
            .FirstOrDefaultAsync(s => s.Id == id);
        return shop is null ? NotFound() : Ok(shop);
    }

    [HttpPost("sellers/{id}/review")]
    public async Task<ActionResult> ReviewSeller(int id, [FromBody] AdminSellerReviewRequest req)
    {
        var shop = await _db.Shops.Include(s => s.Owner).FirstOrDefaultAsync(s => s.Id == id);
        if (shop is null) return NotFound();

        var application = await _db.SellerApplications.FirstOrDefaultAsync(a => a.ShopId == shop.Id);

        if (req.Approve)
        {
            // License auto-check on top of admin approval
            if (shop.LicenseExpiryDate <= DateTime.UtcNow)
                return BadRequest(new ApiError { Error = "License is expired. Cannot approve." });

            shop.Status = ShopStatus.Approved;
            shop.ApprovedAt = DateTime.UtcNow;
            shop.RejectionReason = null;
            if (shop.Owner is not null) shop.Owner.Role = UserRoles.Seller;
            if (application is not null) application.Status = ApplicationStatus.Approved;
        }
        else
        {
            shop.Status = ShopStatus.Rejected;
            shop.RejectionReason = req.RejectionReason ?? "Application rejected";
            if (application is not null)
            {
                application.Status = ApplicationStatus.Rejected;
                application.Notes = req.RejectionReason;
            }
        }
        if (application is not null)
        {
            application.ReviewedAt = DateTime.UtcNow;
            application.ReviewedByAdminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        }
        await _db.SaveChangesAsync();
        return Ok(shop);
    }

    [HttpPost("sellers/{id}/suspend")]
    public async Task<ActionResult> Suspend(int id)
    {
        var shop = await _db.Shops.FirstOrDefaultAsync(s => s.Id == id);
        if (shop is null) return NotFound();
        shop.Status = ShopStatus.Suspended;
        await _db.SaveChangesAsync();
        return Ok(shop);
    }

    [HttpPost("sellers/{id}/reactivate")]
    public async Task<ActionResult> Reactivate(int id)
    {
        var shop = await _db.Shops.FirstOrDefaultAsync(s => s.Id == id);
        if (shop is null) return NotFound();
        if (shop.LicenseExpiryDate <= DateTime.UtcNow)
            return BadRequest(new ApiError { Error = "Cannot reactivate: license expired." });
        shop.Status = ShopStatus.Approved;
        shop.RejectionReason = null;
        await _db.SaveChangesAsync();
        return Ok(shop);
    }

    // ---------- Categories ----------
    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<ActionResult> Categories()
        => Ok(await _db.Categories.OrderBy(c => c.Name).ToListAsync());

    [HttpPost("categories")]
    public async Task<ActionResult> AddCategory([FromBody] CategoryRequest req)
    {
        var c = new Category
        {
            Name = req.Name,
            Slug = req.Name.ToLowerInvariant().Replace(' ', '-'),
            Description = req.Description,
            ParentId = req.ParentId
        };
        _db.Categories.Add(c);
        await _db.SaveChangesAsync();
        return Ok(c);
    }

    [HttpDelete("categories/{id}")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        var c = await _db.Categories.FirstOrDefaultAsync(x => x.Id == id);
        if (c is null) return NotFound();
        _db.Categories.Remove(c);
        await _db.SaveChangesAsync();
        return Ok(new { deleted = true });
    }

    // ---------- Products moderation ----------
    [HttpGet("products")]
    public async Task<ActionResult> AllProducts([FromQuery] string? approval)
    {
        var q = _db.Products
            .Include(p => p.Shop).ThenInclude(s => s!.Owner)
            .Include(p => p.Images)
            .Include(p => p.Category)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(approval) && Enum.TryParse<ProductApproval>(approval, true, out var pa))
            q = q.Where(p => p.ApprovalStatus == pa);
        return Ok(await q.OrderByDescending(p => p.Id).ToListAsync());
    }

    [HttpPost("products/{id}/approve")]
    public async Task<ActionResult> ApproveProduct(int id)
    {
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();
        p.ApprovalStatus = ProductApproval.Approved;
        p.IsActive = true;
        await _db.SaveChangesAsync();
        return Ok(p);
    }

    [HttpPost("products/{id}/reject")]
    public async Task<ActionResult> RejectProduct(int id)
    {
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();
        p.ApprovalStatus = ProductApproval.Rejected;
        p.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(p);
    }

    // ---------- Orders ----------
    [HttpGet("orders")]
    public async Task<ActionResult> Orders()
        => Ok(await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.SellerOrders).ThenInclude(s => s.Shop)
            .OrderByDescending(o => o.Id)
            .ToListAsync());

    [HttpGet("orders/{id}")]
    public async Task<ActionResult> OrderDetail(int id)
    {
        var o = await _db.Orders
            .Include(x => x.Customer)
            .Include(x => x.SellerOrders).ThenInclude(s => s.Items)
            .Include(x => x.SellerOrders).ThenInclude(s => s.Shop)
            .FirstOrDefaultAsync(x => x.Id == id);
        return o is null ? NotFound() : Ok(o);
    }

    // ---------- Customers ----------
    [HttpGet("customers")]
    public async Task<ActionResult> Customers()
        => Ok(await _db.Users.Where(u => u.Role == UserRoles.Customer)
            .OrderByDescending(u => u.Id).ToListAsync());

    // ---------- Commission settings ----------
    [HttpGet("commission")]
    [AllowAnonymous]
    public async Task<ActionResult> GetCommission()
    {
        var current = await _db.CommissionSettings
            .Where(c => c.IsActive)
            .OrderByDescending(c => c.EffectiveFrom)
            .FirstOrDefaultAsync();
        return Ok(current);
    }

    [HttpPost("commission")]
    public async Task<ActionResult> SetCommission([FromBody] CommissionSettingRequest req)
    {
        // deactivate previous
        var existing = await _db.CommissionSettings.Where(c => c.IsActive).ToListAsync();
        foreach (var s in existing) s.IsActive = false;

        var c = new CommissionSetting
        {
            Percentage = req.Percentage,
            IsActive = true,
            EffectiveFrom = DateTime.UtcNow,
            Notes = req.Notes,
            CreatedByAdminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value)
        };
        _db.CommissionSettings.Add(c);
        await _db.SaveChangesAsync();
        return Ok(c);
    }

    // ---------- Reports ----------
    [HttpGet("reports/summary")]
    public async Task<ActionResult> ReportSummary()
    {
        var byStatus = await _db.SellerOrders
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count(), Total = g.Sum(o => o.Total) })
            .ToListAsync();
        var topShops = await _db.SellerOrders
            .GroupBy(o => o.ShopId)
            .Select(g => new { ShopId = g.Key, Orders = g.Count(), Revenue = g.Sum(o => o.Total) })
            .OrderByDescending(x => x.Revenue)
            .Take(5)
            .ToListAsync();
        var recentOrders = await _db.Orders.OrderByDescending(o => o.Id).Take(10)
            .Select(o => new { o.Id, o.OrderNumber, o.Total, o.Status, o.CreatedAt })
            .ToListAsync();
        return Ok(new { byStatus, topShops, recentOrders });
    }

    // ---------- Refunds ----------
    [HttpGet("refunds")]
    public async Task<ActionResult> Refunds()
        => Ok(await _db.Refunds.OrderByDescending(r => r.Id).ToListAsync());

    [HttpPost("refunds/{id}/process")]
    public async Task<ActionResult> ProcessRefund(int id)
    {
        var r = await _db.Refunds.FirstOrDefaultAsync(x => x.Id == id);
        if (r is null) return NotFound();
        r.Status = RefundStatus.Processed;
        r.ResolvedAt = DateTime.UtcNow;
        var order = await _db.Orders.FirstAsync(o => o.Id == r.OrderId);
        order.Status = OrderStatus.Refunded;
        order.PaymentStatus = PaymentStatus.Refunded;
        await _db.SaveChangesAsync();
        return Ok(r);
    }
}