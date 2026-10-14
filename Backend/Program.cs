using System.Text;
using MarketNest.Data;
using MarketNest.Models;
using MarketNest.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = null;
        o.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

// DB - SQL Server connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found in configuration.");
Console.WriteLine($"[DB] SQL Server: {connectionString}");
builder.Services.AddDbContext<MarketNestDbContext>(opt =>
    opt.UseSqlServer(connectionString)
        .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddScoped<ICommissionService, CommissionService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// CORS for frontend dev
builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "MarketNest_Dev_Key_Please_Change_In_Production_32chars_min";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MarketNest";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MarketNestClients";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.RequireHttpsMetadata = false;
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            NameClaimType = System.Security.Claims.ClaimTypes.Name
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Apply migrations + seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MarketNestDbContext>();
    db.Database.Migrate();
    var pw = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await SeedData.SeedAsync(db, pw);
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.MapGet("/", () => Results.Json(new { name = "MarketNest API", status = "running", endpoints = "/api" }));

app.Run();