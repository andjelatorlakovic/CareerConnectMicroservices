using ApplicationService.DTOs;
using ApplicationService.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApplicationService.Controllers;

[ApiController]
[Route("api/job-applications")]
[Authorize]
public class JobApplicationController : ControllerBase
{
    private readonly IJobApplicationService _jobApplicationService;
    private readonly ICandidateService _candidateService;
    private readonly ICompanyService _companyService;

    public JobApplicationController(
        IJobApplicationService jobApplicationService,
        ICandidateService candidateService,
        ICompanyService companyService)
    {
        _jobApplicationService = jobApplicationService;
        _candidateService = candidateService;
        _companyService = companyService;
    }

    [HttpDelete("internal/jobs/{jobId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteForRemovedJob(
        Guid jobId,
        [FromHeader(Name = "X-Internal-Api-Key")] string? apiKey,
        [FromServices] IConfiguration configuration)
    {
        var expectedApiKey = configuration["InternalApiKey"];

        if (string.IsNullOrWhiteSpace(expectedApiKey) ||
            !string.Equals(apiKey, expectedApiKey, StringComparison.Ordinal))
        {
            return Unauthorized();
        }

        await _jobApplicationService.DeleteByJobAsync(jobId);
        return NoContent();
    }

    [HttpPost("jobs/{jobId:guid}")]
    [Authorize(Roles = "Candidate")]
    public async Task<IActionResult> Apply(
        Guid jobId,
        CreateJobApplicationRequest request)
    {
        try
        {
            var candidateProfileId = await _candidateService
                .GetMyProfileIdAsync(GetAuthorizationHeader());

            var application = await _jobApplicationService
                .ApplyJobApplicationAsync(
                    candidateProfileId,
                    jobId,
                    request,
                    GetAuthorizationHeader());

            return Ok(application);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpGet("my")]
    [Authorize(Roles = "Candidate")]
    public async Task<IActionResult> GetMyApplications()
    {
        try
        {
            var candidateProfileId = await _candidateService
                .GetMyProfileIdAsync(GetAuthorizationHeader());

            return Ok(await _jobApplicationService
                .GetMyApplicationsAsync(candidateProfileId));
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpGet("jobs/{jobId:guid}")]
    [Authorize(Roles = "Company")]
    public async Task<IActionResult> GetApplicationsForJob(Guid jobId)
    {
        try
        {
            var companyProfileId = await _companyService
                .GetMyProfileIdAsync(GetAuthorizationHeader());

            return Ok(await _jobApplicationService.GetByJobAsync(
                companyProfileId,
                jobId));
        }
        catch (InvalidOperationException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpGet("{applicationId:guid}/internal")]
    [Authorize(Roles = "Company,Candidate")]
    public async Task<IActionResult> GetInternal(Guid applicationId)
    {
        try
        {
            if (User.IsInRole("Candidate"))
            {
                var candidateProfileId = await _candidateService
                    .GetMyProfileIdAsync(GetAuthorizationHeader());

                return Ok(await _jobApplicationService.GetByCandidateAsync(
                    candidateProfileId,
                    applicationId));
            }

            var companyProfileId = await _companyService
                .GetMyProfileIdAsync(GetAuthorizationHeader());

            return Ok(await _jobApplicationService.GetByIdAsync(
                companyProfileId,
                applicationId));
        }
        catch (InvalidOperationException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPatch("{applicationId:guid}/status")]
    [Authorize(Roles = "Company")]
    public async Task<IActionResult> UpdateStatus(
        Guid applicationId,
        UpdateJobApplicationRequest request)
    {
        try
        {
            var companyProfileId = await _companyService
                .GetMyProfileIdAsync(GetAuthorizationHeader());

            return Ok(await _jobApplicationService.UpdateStatusAsync(
                companyProfileId,
                applicationId,
                request));
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    private string GetAuthorizationHeader()
    {
        var authorizationHeader = Request.Headers.Authorization.ToString();

        if (string.IsNullOrWhiteSpace(authorizationHeader))
        {
            throw new UnauthorizedAccessException("Missing authorization.");
        }

        return authorizationHeader;
    }
}
