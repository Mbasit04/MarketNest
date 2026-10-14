using System.ComponentModel.DataAnnotations;

namespace MarketNest.Models;

public class Cart
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public User? Customer { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem
{
    public int Id { get; set; }
    public int CartId { get; set; }
    public Cart? Cart { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; } = 1;

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}