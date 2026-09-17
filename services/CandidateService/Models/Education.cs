namespace CandidateService.Models;
public class Education
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CandidateProfileId { get; set; }
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public Education(string institution, string degree, string fieldOfStudy, DateTime startDate, DateTime endDate)
    {
        Institution = institution;
        Degree = degree;
        FieldOfStudy = fieldOfStudy;
        StartDate = startDate;
        EndDate = endDate;
    }
    public Education()
    {
    }
}
