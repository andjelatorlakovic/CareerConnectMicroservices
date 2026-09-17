using ApplicationService.Enums;

namespace ApplicationService.Models;
public class JobApplication
{
    public JobApplication()
    {
    }

    public Guid Id {get; set;} = Guid.NewGuid();
    public Guid CandidateProfileId {get;set;}
    public Guid JobListingId {get; set;}
    public string CoverLetter {get; set;} = String.Empty;
    public ApplicationStatus Status {get; set;} = ApplicationStatus.Pending;
    public DateTime AppliedAt {get; set;} = DateTime.UtcNow;


    
    public JobApplication(Guid candidateProfileId, Guid jobListingId, string coverLetter, ApplicationStatus status)
    {
        CandidateProfileId= candidateProfileId;
        JobListingId= jobListingId;
        CoverLetter=coverLetter;
        Status=status;
    }
}
