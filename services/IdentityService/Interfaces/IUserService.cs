using IdentityService.DTOs.User;

namespace IdentityService.Interfaces;
public interface IUserService
{
    //Sve role korisnika imaju pristup ovim metodama
   Task<UserDto> GetByIdAsync(Guid userId);
   Task<UserDto> UpdateAsync(Guid userId, UpdateUserRequest request);
   Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    //Metode dostupne samo korisnicima sa ulogom Admin
   Task<IEnumerable<UserDto>> GetAllUsersAsync();
   Task DeactivateUserAsync(Guid userId);
   Task ActivateUserAsync(Guid userId);
}
