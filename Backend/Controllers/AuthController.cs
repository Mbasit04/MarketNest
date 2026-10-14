using MarketNest.Data;
using MarketNest.Models;
using MarketNest.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketNest.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly MarketNestDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtService _jwt;

    public AuthController(MarketNestDbContext db, IPasswordHasher hasher, IJwtService jwt)
    {
        _db = db; _hasher = hasher; _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new ApiError { Error = "Email already registered" });

        var user = new User
        {
            FullName = req.FullName,
            Email = req.Email,
            PasswordHash = _hasher.Hash(req.Password),
            Phone = req.Phone,
            Role = UserRoles.Customer
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Empty cart
        _db.Carts.Add(new Cart { CustomerId = user.Id });
        await _db.SaveChangesAsync();

        return Ok(BuildResponse(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user is null || !_hasher.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new ApiError { Error = "Invalid email or password" });
        if (!user.IsActive)
            return Forbid();

        return Ok(BuildResponse(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var id = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.Include(u => u.Shop).FirstOrDefaultAsync(u => u.Id == id);
        return user is null ? Unauthorized() : Ok(BuildResponse(user));
    }

    private AuthResponse BuildResponse(User user)
    {
        var shop = _db.Shops.FirstOrDefault(s => s.OwnerUserId == user.Id);
        return new AuthResponse
        {
            Token = _jwt.CreateToken(user),
            Role = user.Role,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            ShopId = shop?.Id,
            ShopStatus = shop?.Status.ToString()
        };
    }
}