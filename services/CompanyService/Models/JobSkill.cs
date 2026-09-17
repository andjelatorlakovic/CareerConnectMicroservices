using CompanyService.Enums;

namespace CompanyService.Models;
public class JobSkill
{
    public Guid JobListingId {get; set;}
    public Skill Skill {get; set;}

    public JobSkill(){}
}
