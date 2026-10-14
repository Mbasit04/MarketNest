using MarketNest.Data;
using MarketNest.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketNest.Controllers;

[ApiController]
[Route("api/catalog")]
public class CatalogController : ControllerBase
{
    private readonly MarketNestDbContext _db;
    public CatalogController(MarketNestDbContext db) { _db = db; }

    [HttpGet("products")]
    public async Task<ActionResult> Products(
        [FromQuery] string? q_search,
        [FromQuery] int? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? shopId,
        [FromQuery] string? sort = "newest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .Include(p => p.Shop)
            .Include(p => p.Images)
            .Where(p => p.IsActive && p.ApprovalStatus == ProductApproval.Approved)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q_search))
            query = query.Where(p => p.Name.Contains(q_search) || p.Description.Contains(q_search) || p.Brand.Contains(q_search));
        if (categoryId.HasValue) query = query.Where(p => p.CategoryId == categoryId);
        if (shopId.HasValue) query = query.Where(p => p.ShopId == shopId);
        if (minPrice.HasValue) query = query.Where(p => p.Price >= minPrice);
        if (maxPrice.HasValue) query = query.Where(p => p.Price <= maxPrice);

        query = sort switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "name" => query.OrderBy(p => p.Name),
            _ => query.OrderByDescending(p => p.Id)
        };

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("products/{id}")]
    public async Task<ActionResult> ProductDetail(int id)
    {
        var p = await _db.Products
            .Include(x => x.Category)
            .Include(x => x.Shop).ThenInclude(s => s!.Owner)
            .Include(x => x.Images)
            .Include(x => x.Reviews).ThenInclude(r => r.Customer)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
        if (p is null) return NotFound();
        return Ok(p);
    }

    [HttpGet("categories")]
    public async Task<ActionResult> Categories()
        => Ok(await _db.Categories.OrderBy(c => c.Name).ToListAsync());

    [HttpGet("featured")]
    public async Task<ActionResult> Featured()
    {
        var items = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Shop)
            .Where(p => p.IsActive && p.ApprovalStatus == ProductApproval.Approved)
            .OrderByDescending(p => p.Id)
            .Take(8)
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("deals")]
    public async Task<ActionResult> Deals()
    {
        var deals = await _db.Deals.Where(d => d.IsActive && d.StartsAt <= DateTime.UtcNow && d.EndsAt >= DateTime.UtcNow).ToListAsync();
        return Ok(deals);
    }
}