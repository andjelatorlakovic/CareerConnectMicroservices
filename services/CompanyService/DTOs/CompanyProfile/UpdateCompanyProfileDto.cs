using System.ComponentModel.DataAnnotations;

namespace CompanyService.DTOs.CompanyProfile;
public class UpdateCompanyProfileDto
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(2000, MinimumLength = 20)]
    public string Description { get; set; } = string.Empty;

    [Required, StringLength(120, MinimumLength = 2)]
    public string Location { get; set; } = string.Empty;

    [Url, StringLength(300)]
    public string? Website { get; set; }

    [Required, StringLength(100, MinimumLength = 2)]
    public string Industry { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(254)]
    public string ContactEmail {get; set;}= string.Empty;

    [Required, Phone, StringLength(32, MinimumLength = 6)]
    public string ContactPhone {get; set;}= string.Empty;
}
