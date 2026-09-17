
using IdentityService.Enums;

namespace IdentityService.DTOs.User;
public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; } 
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
