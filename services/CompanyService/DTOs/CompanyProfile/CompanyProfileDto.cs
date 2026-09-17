namespace CompanyService.DTOs.CompanyProfile;
public class CompanyProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string ContactEmail {get; set;}= string.Empty;
    public string ContactPhone {get; set;}= string.Empty;
}
