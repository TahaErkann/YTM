using Microsoft.Extensions.Options;
using MongoDB.Driver;
using YTM.Core.Entities;
using YTM.Core.Repositories;
using YTM.Core.Settings;

namespace YTM.Data.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(IOptions<DatabaseSettings> settings) 
            : base(settings, settings.Value.UsersCollectionName)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _collection.Find(u => u.Email.ToLower() == email.ToLower()).FirstOrDefaultAsync();
        }

        public async Task<bool> CheckPasswordAsync(string email, string password)
        {
            var user = await GetByEmailAsync(email);
            if (user == null) return false;

            // Admin için özel kontrol
            if (user.Role == "Admin" && user.Password == password)
                return true;

            // Normal kullanıcılar için hash kontrolü
            return BCrypt.Net.BCrypt.Verify(password, user.Password);
        }

        public async Task UpdateAsync(User user)
        {
            if (user.Id != null)
            {
                await UpdateAsync(user.Id, user);
            }
        }
    }
} 