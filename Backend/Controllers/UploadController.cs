using MarketNest.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketNest.Controllers;

[ApiController]
[Route("api/upload")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    public UploadController(IWebHostEnvironment env) { _env = env; }

    public class UploadResult
    {
        public string Path { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long Size { get; set; }
    }

    [HttpPost]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<UploadResult>> Upload(IFormFile file, [FromQuery] string? folder = null)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new ApiError { Error = "No file provided" });

        var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return BadRequest(new ApiError { Error = "Unsupported file type" });

        folder = string.IsNullOrWhiteSpace(folder) ? "uploads" : folder.Replace("..", "_");
        var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var target = Path.Combine(wwwroot, folder);
        Directory.CreateDirectory(target);

        var fname = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(target, fname);
        using (var stream = System.IO.File.Create(fullPath))
            await file.CopyToAsync(stream);

        var urlPath = $"/{folder}/{fname}";
        return Ok(new UploadResult { Path = urlPath, FileName = file.FileName, Size = file.Length });
    }
}