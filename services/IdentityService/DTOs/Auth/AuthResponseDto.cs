using IdentityService.Enums;

namespace IdentityService.DTOs.Auth;
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}
