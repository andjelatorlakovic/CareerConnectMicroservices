using CompanyService.DTOs.CompanyProfile;

namespace CompanyService.Interfaces;
public interface ICompanyService
{
    Task<CompanyProfileDto> GetOrCreateAsync(Guid userId);
    Task<CompanyProfileDto> UpdateCompanyProfileAsync(Guid userId, UpdateCompanyProfileDto profileDto);
    Task <bool> DeleteAsync(Guid companyProfileId);
}
