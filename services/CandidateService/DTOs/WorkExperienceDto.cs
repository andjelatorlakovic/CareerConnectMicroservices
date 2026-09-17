namespace CandidateService.DTOs;
public class WorkExperienceDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Company { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
