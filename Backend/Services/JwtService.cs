using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MarketNest.Models;
using Microsoft.IdentityModel.Tokens;

namespace MarketNest.Services;

public interface IJwtService
{
    string CreateToken(User user);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _cfg;
    public JwtService(IConfiguration cfg) { _cfg = cfg; }

    public string CreateToken(User user)
    {
        var key = _cfg["Jwt:Key"] ?? "MarketNest_Dev_Key_Please_Change_In_Production_32chars_min";
        var issuer = _cfg["Jwt:Issuer"] ?? "MarketNest";
        var audience = _cfg["Jwt:Audience"] ?? "MarketNestClients";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role),
        };

        var keyBytes = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(keyBytes, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(issuer, audience, claims,
            expires: DateTime.UtcNow.AddDays(7), signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}