using WebApi.Application.Interfaces;
using WebApi.Application.DTOs;
using WebApi.Shared.Responses;
using WebApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Api.Endpoints;

public static class Endpoints
{
    public static IEndpointRouteBuilder MapV1(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api/v1");


        // API: HEALTH CHECK
        api.MapGet("/health", () => Results.Ok(new ApiResponse<string>("OK")));

        // API: GET CATEGORIES
        api.MapGet("/categories", async (ICategoryService categories) =>
        {
            var data = await categories.GetRootCategoriesAsync();
            return Results.Ok(new ApiResponse<List<CategoryDto>>(data));
        });

        // API: GET CATEGORY BY SLUG
        api.MapGet("/categories/{slug}", async (AppDbContext db, string slug) =>
        {
            var c = await db.Categories.FirstOrDefaultAsync(c => c.Slug == slug);
            if (c is null)
                return Results.NotFound(new ApiResponse<object>(null, new List<ApiError> { ApiError.NotFound($"Category '{slug}' not found.") }));
            var dto = new CategoryDto(c.Id.ToString(), c.Name, c.Slug, c.ImageUrl, c.Subtitle);
            return Results.Ok(new ApiResponse<CategoryDto>(dto));
        });



        // API: CREATE CATEGORY
        api.MapPost("/categories", async (ICategoryService categories, CreateCategoryRequest request) =>
        {
            var id = await categories.CreateCategoryAsync(request);
            return Results.Created($"/api/v1/categories/{id}", new ApiResponse<object>(new { id }));
        });

        // API: UPDATE CATEGORY
        api.MapPut("/categories/{slug}", async (AppDbContext db, ICategoryService categories, string slug, CreateCategoryRequest request) =>
        {
            var c = await db.Categories.FirstOrDefaultAsync(c => c.Slug == slug);
            if (c is null)
                return Results.NotFound(new ApiResponse<object>(null, new List<ApiError> { ApiError.NotFound($"Category '{slug}' not found.") }));
            var ok = await categories.UpdateCategoryAsync(c.Id, request);
            return ok ? Results.NoContent() : Results.StatusCode(500);
        });

        // API: DELETE CATEGORY
        api.MapDelete("/categories/{slug}", async (AppDbContext db, ICategoryService categories, string slug) =>
        {
            var c = await db.Categories.FirstOrDefaultAsync(c => c.Slug == slug);
            if (c is null)
                return Results.NotFound(new ApiResponse<object>(null, new List<ApiError> { ApiError.NotFound($"Category '{slug}' not found.") }));
            var ok = await categories.DeleteCategoryAsync(c.Id);
            return ok ? Results.NoContent() : Results.StatusCode(500);
        });

        // API: GET SUBCATEGORIES
        api.MapGet("/categories/{slug}/subcategories", async (ICategoryService categories, string slug) =>
        {
            var data = await categories.GetSubcategoriesAsync(slug);
            return Results.Ok(new ApiResponse<List<CategoryDto>>(data));
        });

        // API: GET PRODUCTS
        api.MapGet("/products", async (
            IProductService products,
            string? category,
            string? subcategory,
            string? search,
            decimal? minPrice,
            decimal? maxPrice,
            string? sort,
            int page = 1,
            int pageSize = 20) =>
        {
            var data = await products.GetProductsAsync(category, subcategory, search, minPrice, maxPrice, sort, page, pageSize);
            return Results.Ok(new ApiResponse<PagedResponse<ProductListItemDto>>(data));
        });

        // API: GET PRODUCT DETAIL
        api.MapGet("/products/{id}", async (IProductService products, Guid id) =>
        {
            var p = await products.GetProductByIdAsync(id);
            return p is null
                ? Results.NotFound(new ApiResponse<object>(null, new List<ApiError> { ApiError.NotFound($"Product '{id}' not found.") }))
                : Results.Ok(new ApiResponse<ProductDetailDto>(p));
        });

        // API: CREATE PRODUCT
        api.MapPost("/products", async (IProductService products, CreateProductRequest request) =>
        {
            var id = await products.CreateProductAsync(request);
            return Results.Created($"/api/v1/products/{id}", new ApiResponse<object>(new { id }));
        });

        // API: FULL UPDATE PRODUCT
        api.MapPut("/products/{id}", async (IProductService products, Guid id, CreateProductRequest request) =>
        {
            var ok = await products.UpdateProductAsync(id, request);
            return ok ? Results.NoContent() : Results.NotFound(new ApiResponse<object>(null, new List<ApiError> { ApiError.NotFound($"Product '{id}' not found.") }));
        });

        // API: DELETE PRODUCT
        api.MapDelete("/products/{id}", async (IProductService products, Guid id) =>
        {
            var ok = await products.DeleteProductAsync(id);
            return ok ? Results.NoContent() : Results.NotFound(new ApiResponse<object>(null, new List<ApiError> { ApiError.NotFound($"Product '{id}' not found.") }));
        });

        // API: GET PRODUCTS BY CATEGORY
        api.MapGet("/categories/{slug}/products", async (IProductService products, string slug, int page = 1, int pageSize = 20) =>
        {
            var data = await products.GetProductsByCategoryAsync(slug, page, pageSize);
            return Results.Ok(new ApiResponse<PagedResponse<ProductListItemDto>>(data));
        });
        
        // API: PARTIAL UPDATE PRODUCT IMAGEURL AND IMAGES
        // CHECK: chatgpt
        api.MapPatch("/products/{id}/images", async (AppDbContext db, Guid id, UpdateProductImagesRequest request) =>
        {
            var exists = await db.Products.AnyAsync(p => p.Id == id);
            if (!exists)
                return Results.NotFound(new ApiResponse<object>(null, new List<ApiError> { ApiError.NotFound($"Product '{id}' not found.") }));

            if (request.ImageUrl is not null)
            {
                await db.Products
                    .Where(p => p.Id == id)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(p => p.ImageUrl, request.ImageUrl));
            }

            if (request.Images is not null)
            {
                await db.ProductImages.Where(pi => pi.ProductId == id).ExecuteDeleteAsync();

                if (request.Images.Count > 0)
                {
                    var newImages = request.Images.Select(url => new WebApi.Domain.Entities.ProductImage
                    {
                        ProductId = id,
                        Url = url
                    });
                    await db.ProductImages.AddRangeAsync(newImages);
                    await db.SaveChangesAsync();
                }
            }

            return Results.NoContent();
        });


        // API: GET FLASH SALE
        api.MapGet("/flash-sale", (IFlashSaleService flashSale) => Results.Ok(new ApiResponse<FlashSaleDto>(flashSale.GetFlashSale())));

        return app;
    }
}


