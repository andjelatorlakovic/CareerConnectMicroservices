using CandidateService.Enums;

namespace CandidateService.Models;

public class CandidateDesiredJobCategory
{
    public Guid CandidateProfileId { get; set; }

    public JobCategory JobCategory { get; set; }
}
