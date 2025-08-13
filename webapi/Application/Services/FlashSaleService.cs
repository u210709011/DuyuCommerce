using WebApi.Application.Interfaces;

namespace WebApi.Application.Services;

public class FlashSaleService : IFlashSaleService
{
    private static readonly FlashSaleDto Flash = new(
        IsActive: true,
        EndTime: DateTimeOffset.UtcNow.AddHours(24),
        PerProductDiscountPercent: new Dictionary<string, int>
        {
            ["everyday-sneakers"] = 30,
            ["leather-boots"] = 25
        },
        Title: "Flash Sale - Limited Time!",
        Description: "Up to 30% off selected items"
    );

    public FlashSaleDto GetFlashSale() => Flash;
}




