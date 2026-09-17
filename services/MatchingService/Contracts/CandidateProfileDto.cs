namespace MatchingService.Contracts;

public class CandidateProfileDto
{
    public Guid Id { get; set; }

    public List<string> Skills { get; set; } = [];

    public List<string> DesiredJobCategories { get; set; } = [];
}
