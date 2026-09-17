namespace CandidateService.Models;

public class WorkExperience
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CandidateProfileId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public WorkExperience(string companyName, string position, string description, DateTime startDate, DateTime? endDate)
    {
        CompanyName = companyName;
        Position = position;
        Description = description;
        StartDate = startDate;
        EndDate = endDate;
    }
    public WorkExperience()
    {
    }
}
