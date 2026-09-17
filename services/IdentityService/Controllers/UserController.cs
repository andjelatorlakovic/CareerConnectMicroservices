using System.Security.Claims;
using IdentityService.DTOs.User;
using IdentityService.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    public UserController(IUserService userService)
    {
        _userService = userService;
    }
    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(value, out var userId))
            throw new UnauthorizedAccessException("Korisnik nije validan.");
        return userId;
    }
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        try
        {
            var user = await _userService.GetByIdAsync(GetUserId());
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(UpdateUserRequest request)
    {
        try
        {
            var updatedUser = await _userService.UpdateAsync(GetUserId(), request);
            return Ok(updatedUser);    
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
    [HttpPatch("me/password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
         try
        {
            await _userService.ChangePasswordAsync(GetUserId(), request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }
    [HttpGet("{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserById(Guid userId)
    {
        try
        {
            var user = await _userService.GetByIdAsync(userId);

            return Ok(user);
        }
        catch (InvalidOperationException exception)
        {
            return NotFound(new
            {
                message = exception.Message
            });
        }
    }
    [HttpPatch("{userId}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateUser(Guid userId)
    {
        try
        {
            await _userService.DeactivateUserAsync(userId);
            return NoContent();
        }   
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
    [HttpPatch("{userId}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateUser(Guid userId)
    {
        try
        {
            await _userService.ActivateUserAsync(userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
