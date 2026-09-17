namespace MatchingService.Contracts;

public class JobListingDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string JobCategory { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public List<string> Skills { get; set; } = [];
}
