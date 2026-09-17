using IdentityService.Data;
using IdentityService.DTOs.Auth;
using IdentityService.Enums;
using IdentityService.Interfaces;
using IdentityService.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace IdentityService.Services;
public class AuthService : IAuthService
{
    private readonly IdentityDbContext _context;
    private readonly IConfiguration _configuration;

   public AuthService(IdentityDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        if (registerDto.Role != UserRole.Company &&
            (string.IsNullOrWhiteSpace(registerDto.FirstName) ||
             string.IsNullOrWhiteSpace(registerDto.LastName)))
        {
            throw new InvalidOperationException(
                "Ime i prezime su obavezni za kandidata.");
        }

        var email = registerDto.Email.ToLower();
        var userAlreadyExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == email);
        if (userAlreadyExists)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }
        var user = new User
        {
            FirstName = string.IsNullOrWhiteSpace(registerDto.FirstName)
                ? null
                : registerDto.FirstName.Trim(),
            LastName = string.IsNullOrWhiteSpace(registerDto.LastName)
                ? null
                : registerDto.LastName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Role = registerDto.Role
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return createAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var email = loginDto.Email.ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }
        return createAuthResponse(user);
    }
    private AuthResponseDto createAuthResponse(User user)
    {
        
        return new AuthResponseDto
        {
            Token = CreateToken(user),
            Email = user.Email,
            Role = user.Role
        };
    }
    private string CreateToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public Task Logoutasync()
    {
        return Task.CompletedTask;
    }
}
