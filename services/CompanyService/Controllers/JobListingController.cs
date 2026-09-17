using System.Security.Claims;
using CompanyService.DTOs.CompanyProfile;
using CompanyService.DTOs.JobListing;
using CompanyService.Enums;
using CompanyService.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompanyService.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize]
public class JobListingController : ControllerBase
{
     private readonly IJobService _jobService;
     private readonly ICompanyService _companyService;
     public JobListingController(IJobService jobService, ICompanyService companyService)
    {
        _jobService=jobService;
        _companyService=companyService;
    }
    //Korisnici mogu da pogledaju oglase
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? location,
        [FromQuery] ExperienceLevel? experienceLevel,
        [FromQuery] List<Skill>? skills)
    {
        var jobs = await _jobService.GetAllAsync(
            location,
            experienceLevel,
            skills ?? []
        );
        return Ok(jobs);
    }
    //Pronadji oglas po id-ju
    [HttpGet("{jobId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid jobId)
    {
        try
        {
            var job = await _jobService.GetByIdAsync(jobId);
            return Ok(job);
        }
        catch(InvalidOperationException)
        {
            return NotFound(new {message="JobListing not found."});
        }
    }
    //Kompanija moze i da vidi samo svoje oglase
    [HttpGet("my")]
    [Authorize(Roles ="Company")]
    public async Task<IActionResult> GetMyJobs()
    {
        var profile= await  GetCompanyProfileAsync();
        var jobs = await _jobService.GetByCompanyAsync(profile.Id);
        return Ok(jobs);
    }
    private async Task<CompanyProfileDto> GetCompanyProfileAsync()
    {
        var userIdValue= User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(!Guid.TryParse(userIdValue,out var userId))
        {
            throw new UnauthorizedAccessException("User not valid.");
        }
        return await _companyService.GetOrCreateAsync(userId);
    }
    [HttpPost]
    [Authorize(Roles ="Company")]
    public async Task<IActionResult> Create(CreateJobListingRequest request)
    {
        try
        {
            var profile = await GetCompanyProfileAsync();
            var job = await _jobService.CreateAsync(profile.Id,request);
            return CreatedAtAction(nameof(GetById), new { jobId = job.Id }, job);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
    [HttpPut("{jobId}")]
    [Authorize(Roles ="Company")]
    public async Task<IActionResult> Update(Guid jobId,UpdateJobListingRequest request)
    {
        try
        {
            var profile = await GetCompanyProfileAsync();
            var job = await _jobService.UpdateAsync(profile.Id,jobId,request);
            return Ok(job);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException)
        {
            return NotFound(new {message="JobListing not found."});
        }
    }
    [HttpPatch("{jobId}/close")]
    [Authorize(Roles ="Company")]
    public async Task<IActionResult> Close(Guid jobId)
    {
        var profile = await GetCompanyProfileAsync();
        var closed = await _jobService.CloseAsync(profile.Id,jobId);
        if (!closed)
        {
            return NotFound(new
            {
                message = "JobListing not found."
            });
        }
        return NoContent();
    }
    [HttpGet("by-user/{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        try
        {
            var jobs = await _jobService.GetByUserAsync(userId);

            return Ok(jobs);
        }
        catch (InvalidOperationException exception)
        {
            return NotFound(new
            {
                message = exception.Message
            });
        }
    }
}
