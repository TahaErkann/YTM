using Microsoft.Extensions.Options;
using YTM.Core.Entities;
using YTM.Core.Repositories;
using YTM.Core.Settings;

namespace YTM.Data.Repositories
{
    public class ProductRepository : GenericRepository<Product>, IProductRepository
    {
        public ProductRepository(IOptions<DatabaseSettings> settings)
            : base(settings, settings.Value.ProductsCollectionName)
        {
        }
    }
} 