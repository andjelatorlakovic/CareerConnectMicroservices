using CandidateService.Enums;

namespace CandidateService.DTOs;
public class CandidateProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public ExperienceLevel ExperienceLevel { get; set; }
    public List<EducationDto> Education { get; set; } = new();
    public List<WorkExperienceDto> WorkExperience { get; set; } = new();
    public List<Skill> Skills { get; set; } = new();
    public List<JobCategory> DesiredJobCategories { get; set; } = new();
}
