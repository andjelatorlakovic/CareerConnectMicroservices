using System.ComponentModel.DataAnnotations;

using IdentityService.Enums;

namespace IdentityService.DTOs.Auth;
public class RegisterDto
{
    [StringLength(80, MinimumLength = 2)]
    public string? FirstName { get; set; }

    [StringLength(80, MinimumLength = 2)]
    public string? LastName { get; set; }

    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; }= string.Empty;

    [Required, StringLength(128, MinimumLength = 6)]
    public string Password { get; set; }= string.Empty;
    public UserRole Role { get; set; }= UserRole.Candidate;
}
