using IdentityService.Enums;

namespace IdentityService.Models;

public class User
{

    public Guid Id { get; set; }= Guid.NewGuid();
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Candidate;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive {get;set;} = true;
    public User(string? firstName, string? lastName, string email, string passwordHash, UserRole role, bool isActive)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        IsActive=isActive;
    }
    public User()
    {
    }
}
