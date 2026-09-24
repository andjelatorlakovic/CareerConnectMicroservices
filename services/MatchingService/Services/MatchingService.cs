using MatchingService.Contracts;
using MatchingService.DTOs;
using MatchingService.Interfaces;

namespace MatchingService.Services;

public class MatchingService : IMatchingService
{
    private readonly ICandidateService _candidateService;
    private readonly ICompanyService _companyService;

    public MatchingService(
        ICandidateService candidateService,
        ICompanyService companyService)
    {
        _candidateService = candidateService;
        _companyService = companyService;
    }

    public async Task<List<MatchResultDto>> GetMatchingJobsAsync(
        string authorizationHeader)
    {
        var candidate = await _candidateService.GetMyProfileAsync(
            authorizationHeader);

        var jobs = await _companyService.GetJobsAsync(
            authorizationHeader);

        var candidateSkills = candidate.Skills.ToHashSet(
            StringComparer.OrdinalIgnoreCase);

        var desiredCategories = candidate.DesiredJobCategories.ToHashSet(
            StringComparer.OrdinalIgnoreCase);

        return jobs
            .Where(job =>
                string.Equals(
                    job.Status,
                    "Active",
                    StringComparison.OrdinalIgnoreCase) &&
                job.ExpiresAt > DateTime.UtcNow &&
                desiredCategories.Contains(job.JobCategory))
            .Select(job => CreateMatchResult(job, candidateSkills))
            .Where(result => result.MatchPercentage > 0)
            .OrderByDescending(result => result.MatchPercentage)
            .ToList();
    }

    private static MatchResultDto CreateMatchResult(
        JobListingDto job,
        HashSet<string> candidateSkills)
    {
        var requiredSkills = job.Skills
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var matchedSkills = requiredSkills
            .Where(candidateSkills.Contains)
            .ToList();

        var missingSkills = requiredSkills
            .Where(skill => !candidateSkills.Contains(skill))
            .ToList();

        var matchPercentage = requiredSkills.Count == 0
            ? 0
            : Math.Round(
                (decimal)matchedSkills.Count / requiredSkills.Count * 100,
                2);

        return new MatchResultDto
        {
            JobId = job.Id,
            Tittle = job.Title,
            Location = job.Location,
            JobCategory = job.JobCategory,
            RequiredSkills = requiredSkills,
            MatchedSkills = matchedSkills,
            MissingSkills = missingSkills,
            MatchPercentage = matchPercentage
        };
    }
}
