using CompanyService.Enums;

namespace CompanyService.DTOs.JobListing;
public class JobListingDto
{
    public Guid Id { get; set; }
    public Guid CompanyProfileId { get; set; }
    public string Title {get; set;}= string.Empty;
    public string Description {get; set;} = string.Empty;
    public string Location {get; set;} = string.Empty;
    public ExperienceLevel ExperienceLevel {get; set;}
    public JobCategory JobCategory { get; set; }
    public JobStatus Status {get; set;} = JobStatus.Active;
    public DateTime CreatedAt {get; set;}= DateTime.UtcNow;
    public DateTime ExpiresAt {get; set;}
    public List<Skill> Skills { get; set; } = new();
    public EmploymentType EmploymentType{get; set;}
    public decimal? SalaryMin {get; set;}
    public decimal? SalaryMax {get; set;}
}
