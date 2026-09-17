using ApplicationService.Enums;

namespace ApplicationService.DTOs;
public class JobApplicationDto
{
    public Guid Id {get; set;}
    public Guid CandidateProfileId {get;set;}
    public Guid JobListingId {get; set;}
    public string CoverLetter {get; set;} = String.Empty;
    public ApplicationStatus Status {get; set;} 
    public DateTime AppliedAt {get; set;} 
}
