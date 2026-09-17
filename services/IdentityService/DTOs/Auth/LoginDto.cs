using System.ComponentModel.DataAnnotations;

namespace IdentityService.DTOs.Auth;
public class LoginDto
{
    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(128, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}
