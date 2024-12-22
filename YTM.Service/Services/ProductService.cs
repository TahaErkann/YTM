using YTM.Core.Entities;
using YTM.Core.Repositories;
using YTM.Core.Services;

namespace YTM.Service.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            return await _productRepository.GetAllAsync();
        }

        public async Task<Product?> GetProductByIdAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
                return null;
                
            return await _productRepository.GetByIdAsync(id);
        }

        public async Task CreateProductAsync(Product product)
        {
            await _productRepository.CreateAsync(product);
        }

        public async Task UpdateProductAsync(string id, Product product)
        {
            if (!string.IsNullOrEmpty(id))
            {
                await _productRepository.UpdateAsync(id, product);
            }
        }

        public async Task DeleteProductAsync(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                await _productRepository.DeleteAsync(id);
            }
        }
    }
} 