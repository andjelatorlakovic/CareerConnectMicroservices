using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CompanyService.DTOs.CompanyProfile;
using CompanyService.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace CompanyService.Controllers;

[ApiController]
[Route("api/company-profile")]
[Authorize(Roles = "Company")]
public class CompanyController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompanyController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetOrCreateCompanyProfile()
    {
        var userId = GetUserIdFromClaims();
        var profile = await _companyService.GetOrCreateAsync(userId);
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateCompanyProfile([FromBody] UpdateCompanyProfileDto profileDto)
    {
        var userId = GetUserIdFromClaims();
        var updatedProfile = await _companyService.UpdateCompanyProfileAsync(userId, profileDto);
        return Ok(updatedProfile);
    }

    private Guid GetUserIdFromClaims()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("User ID claim is missing or invalid.");
        }
        return userId;
    }
}
