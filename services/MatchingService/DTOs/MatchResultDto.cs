namespace MatchingService.DTOs;

public class MatchResultDto
{
    public Guid JobId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string JobCategory { get; set; } = string.Empty;
    public List<string> RequiredSkills { get; set; } = [];
    public List<string> MatchedSkills { get; set; } = [];
    public List<string> MissingSkills { get; set; } = [];
    public decimal MatchPercentage { get; set; }
}
