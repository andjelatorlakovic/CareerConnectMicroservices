namespace ApplicationService.Contracts;

public class JobListingDto
{
    public Guid Id { get; set; }
    public Guid CompanyProfileId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string Status { get; set; } = string.Empty;
}
