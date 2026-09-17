using IdentityService.DTOs.Auth;

namespace IdentityService.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);

    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task Logoutasync();
}
