using YTM.Core.Entities;

namespace YTM.Core.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<bool> CheckPasswordAsync(string email, string password);
    }
} 