using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using YTM.Core.DTOs;
using YTM.Core.Entities;
using YTM.Core.Services;

namespace YTM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserService userService, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _userService = userService;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                _logger.LogInformation($"Login attempt for email: {loginDto.Email}");

                var user = await _userService.GetUserByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    return Unauthorized(new { message = "Geçersiz e-posta veya şifre" });
                }

                // Admin için özel kontrol
                if (user.Role == "Admin" && user.Password == loginDto.Password)
                {
                    var token = GenerateJwtToken(user);
                    _logger.LogInformation($"Admin login successful: {user.Email}");
                    return Ok(new { token });
                }

                // Normal kullanıcılar için hash kontrolü
                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                {
                    return Unauthorized(new { message = "Geçersiz e-posta veya şifre" });
                }

                var userToken = GenerateJwtToken(user);
                _logger.LogInformation($"User login successful: {user.Email}");
                return Ok(new { token = userToken });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex.Message}");
                return StatusCode(500, new { message = "Giriş işlemi sırasında bir hata oluştu" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT key is not configured");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("UserId", user.Id ?? string.Empty)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
} 