using System.ComponentModel.DataAnnotations;
using CompanyService.Enums;

namespace CompanyService.DTOs.JobListing;
public class UpdateJobListingRequest
{
    [Required, StringLength(150, MinimumLength = 3)]
    public string Title {get; set;}= string.Empty;

    [Required, StringLength(5000, MinimumLength = 20)]
    public string Description {get; set;} = string.Empty;

    [Required, StringLength(120, MinimumLength = 2)]
    public string Location {get; set;} = string.Empty;
    public ExperienceLevel ExperienceLevel {get; set;}
    public JobCategory JobCategory { get; set; }
    public DateTime ExpiresAt {get; set;}
    [MinLength(1)]
    public List<Skill> Skills { get; set; } = new();
    public EmploymentType EmploymentType{get; set;}
    [Range(typeof(decimal), "0", "999999999")]
    public decimal? SalaryMin {get; set;}
    [Range(typeof(decimal), "0", "999999999")]
    public decimal? SalaryMax {get; set;}
}
