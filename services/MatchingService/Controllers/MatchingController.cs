using MatchingService.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchingService.Controllers;

[ApiController]
[Route("api/matching")]
[Authorize(Roles = "Candidate")]
public class MatchingController : ControllerBase
{
    private readonly IMatchingService _matchingService;

    public MatchingController(IMatchingService matchingService)
    {
        _matchingService = matchingService;
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> GetMatchingJobs()
    {
        try
        {
            var authorizationHeader = Request.Headers.Authorization.ToString();

            if (string.IsNullOrWhiteSpace(authorizationHeader))
            {
                return Unauthorized();
            }

            return Ok(await _matchingService.GetMatchingJobsAsync(
                authorizationHeader));
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}
