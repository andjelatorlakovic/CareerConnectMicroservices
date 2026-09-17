namespace QuizService.Contracts;

public class JobApplicationDto
{
    public Guid Id { get; set; }
    public Guid CandidateProfileId { get; set; }
    public Guid JobListingId { get; set; }
}
