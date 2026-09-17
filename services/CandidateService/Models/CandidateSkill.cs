using CandidateService.Enums;

namespace CandidateService.Models;
public class CandidateSkill
{
    public Guid CandidateProfileId { get; set; }
    public Skill Skill { get; set; } 

    public CandidateSkill(Guid candidateProfileId, Skill skill)
    {
        CandidateProfileId = candidateProfileId;
        Skill = skill;
    }
    public CandidateSkill()
    {
    }
}
