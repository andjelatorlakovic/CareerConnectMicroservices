using CandidateService.Enums;

namespace CandidateService.Models;
public class CandidateProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; } 
    public string? Bio { get; set; } = string.Empty;
    public string? Location { get; set; } = string.Empty;
    public ExperienceLevel ExperienceLevel { get; set; }

    public List<Education> Education { get; set; } = new();
    public List<WorkExperience> WorkExperience { get; set; } = new();
    public List<CandidateSkill> Skills { get; set; } = new();
    public List<CandidateDesiredJobCategory> DesiredJobCategories { get; set; } = new();

    public CandidateProfile(Guid userId, string? bio, string? location, ExperienceLevel experienceLevel)
    {
        UserId = userId;
        Bio = bio;
        Location = location;
        ExperienceLevel = experienceLevel;
    }
    public CandidateProfile()
    {
    }
}
