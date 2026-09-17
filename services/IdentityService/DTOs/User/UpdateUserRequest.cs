using System.ComponentModel.DataAnnotations;

namespace IdentityService.DTOs.User;
public class UpdateUserRequest
{
    [Required, StringLength(80, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(80, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; }  = string.Empty;

}
