using IdentityService.Data;
using IdentityService.DTOs.User;
using IdentityService.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Services;

public class UserService : IUserService
{
    private readonly IdentityDbContext _context;

    public UserService(IdentityDbContext context)
    {
        _context = context;
    }
    public async Task ActivateUserAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new InvalidOperationException("User not found.");
        user.IsActive = true;
        await _context.SaveChangesAsync();
    }

    public Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = _context.Users.FirstOrDefault(u => u.Id == userId) ?? throw new InvalidOperationException("User not found.");
        if(!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new InvalidOperationException("Current password is incorrect.");
        }
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        return _context.SaveChangesAsync();
    }

    public async Task DeactivateUserAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new InvalidOperationException("User not found.");
        user.IsActive = false;
        await _context.SaveChangesAsync();
    }



    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _context.Users.OrderBy(u => u.CreatedAt).ToListAsync();
        return users.Select(u => new UserDto
        {
            Id = u.Id,
            FirstName = u.FirstName ?? string.Empty,
            LastName = u.LastName ?? string.Empty,
            Email = u.Email,
            Role = u.Role,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        }).ToList();
    }

    public async Task<UserDto> GetByIdAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new InvalidOperationException("User not found.");
        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName ?? string.Empty,
            LastName = user.LastName ?? string.Empty,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto> UpdateAsync(Guid userId, UpdateUserRequest request)
    {
        var user =  await _context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new InvalidOperationException("User not found.");
        var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId);
        if(emailExists) throw new InvalidOperationException("Email already exists.");
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        await _context.SaveChangesAsync();
        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName ?? string.Empty,
            LastName = user.LastName ?? string.Empty,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
