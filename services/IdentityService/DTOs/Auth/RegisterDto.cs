using System.ComponentModel.DataAnnotations;

using IdentityService.Enums;

namespace IdentityService.DTOs.Auth;
public class RegisterDto
{
    [RegularExpression(
        @"^$|^.{2,80}$",
        ErrorMessage = "First name must be between 2 and 80 characters when provided.")]
    public string? FirstName { get; set; }

    [RegularExpression(
        @"^$|^.{2,80}$",
        ErrorMessage = "Last name must be between 2 and 80 characters when provided.")]
    public string? LastName { get; set; }

    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; }= string.Empty;

    [Required, StringLength(128, MinimumLength = 6)]
    public string Password { get; set; }= string.Empty;
    public UserRole Role { get; set; }= UserRole.Candidate;
}
