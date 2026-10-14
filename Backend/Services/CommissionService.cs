using MarketNest.Data;
using MarketNest.Models;
using Microsoft.EntityFrameworkCore;

namespace MarketNest.Services;

public interface ICommissionService
{
    Task<decimal> GetActivePercentageAsync();
    (decimal commission, decimal sellerEarning) Calculate(decimal subtotal, decimal percent);
}

public class CommissionService : ICommissionService
{
    private readonly MarketNestDbContext _db;
    public CommissionService(MarketNestDbContext db) { _db = db; }

    public async Task<decimal> GetActivePercentageAsync()
    {
        var setting = await _db.CommissionSettings
            .Where(c => c.IsActive)
            .OrderByDescending(c => c.EffectiveFrom)
            .FirstOrDefaultAsync();
        return setting?.Percentage ?? 10m;
    }

    public (decimal commission, decimal sellerEarning) Calculate(decimal subtotal, decimal percent)
    {
        var commission = Math.Round(subtotal * (percent / 100m), 2);
        var earning = subtotal - commission;
        return (commission, earning);
    }
}