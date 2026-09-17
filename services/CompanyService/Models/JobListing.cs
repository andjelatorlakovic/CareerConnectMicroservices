using CompanyService.Enums;

namespace CompanyService.Models;
public class JobListing
{
    public Guid Id {get; set;} = Guid.NewGuid();
    public Guid CompanyProfileId {get; set;}

    public string Title {get; set;}= string.Empty;
    public string Description {get; set;} = string.Empty;
    public string Location {get; set;} = string.Empty;
    public ExperienceLevel ExperienceLevel {get; set;}
    public JobStatus Status {get; set;} = JobStatus.Active;
    public DateTime CreatedAt {get; set;}= DateTime.UtcNow;
    public DateTime ExpiresAt {get; set;}
    public List<JobSkill> JobSkills {get; set;} =new();
    public JobCategory JobCategory { get; set; }
    public EmploymentType EmploymentType {get; set;}
    public decimal? SalaryMin{get;set;}
    public decimal? SalaryMax{get; set;}

    public JobListing()
    {
    }

    public JobListing(Guid companyProfileId, string title, string description, string location,
        ExperienceLevel experienceLevel, JobStatus status, DateTime expiresAt, JobCategory jobCategory,EmploymentType employmentType,decimal? salaryMin, decimal? salaryMax, List<JobSkill>? jobSkills = null)
    {
        Id = Guid.NewGuid();
        CompanyProfileId = companyProfileId;
        Title = title;
        Description = description;
        Location = location;
        ExperienceLevel = experienceLevel;
        Status = status;
        ExpiresAt = expiresAt;
        JobSkills = jobSkills ?? new List<JobSkill>();
        JobCategory=jobCategory;
        EmploymentType=employmentType;
        SalaryMin=salaryMin;
        SalaryMax=salaryMax;
    }

}
