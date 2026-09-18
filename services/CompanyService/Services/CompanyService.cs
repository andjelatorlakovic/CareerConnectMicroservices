using CompanyService.Data;
using CompanyService.DTOs.CompanyProfile;
using CompanyService.Interfaces;
using CompanyService.Models;
using Microsoft.EntityFrameworkCore;

namespace CompanyService.Services;

public class CompanyService: ICompanyService
{
    private readonly CompanyDbContext _context;

    public CompanyService(CompanyDbContext context)
    {
        _context = context;
    }
    public async Task<CompanyProfileDto> GetOrCreateAsync(Guid userId)
    {
        var profile = await _context.CompanyProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if(profile == null)
        {
            profile = new CompanyProfile
            {
                UserId = userId,
                Name = string.Empty,
                Description = string.Empty,
                Location = string.Empty,
                Website = string.Empty,
                Industry = string.Empty,
                ContactEmail= string.Empty,
                ContactPhone= string.Empty
            };
            _context.CompanyProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }
        return MapToDto(profile);
    }

    public async Task<CompanyProfileDto> UpdateCompanyProfileAsync(Guid userId, UpdateCompanyProfileDto profileDto)
    {
        if (string.IsNullOrWhiteSpace(profileDto.Name) ||
            string.IsNullOrWhiteSpace(profileDto.Industry) ||
            string.IsNullOrWhiteSpace(profileDto.Location) ||
            string.IsNullOrWhiteSpace(profileDto.Description) ||
            string.IsNullOrWhiteSpace(profileDto.ContactEmail) ||
            string.IsNullOrWhiteSpace(profileDto.ContactPhone))
        {
            throw new InvalidOperationException(
                "Popunite sva obavezna osnovna polja profila kompanije.");
        }

        var profile = await _context.CompanyProfiles.FirstOrDefaultAsync(p => p.UserId == userId) 
            ?? throw new Exception("Company profile not found.");
        
        profile.Name = profileDto.Name.Trim();
        profile.Description = profileDto.Description.Trim();
        profile.Location = profileDto.Location.Trim();
        profile.Website = profileDto.Website?.Trim() ?? string.Empty;
        profile.Industry = profileDto.Industry.Trim();
        profile.ContactEmail = profileDto.ContactEmail.Trim();
        profile.ContactPhone = profileDto.ContactPhone.Trim();

        await _context.SaveChangesAsync();
        return MapToDto(profile);
    }
    private static CompanyProfileDto MapToDto(CompanyProfile profile)=>new()
        {
            Id = profile.Id,
            UserId = profile.UserId,
            Name = profile.Name,
            Description = profile.Description,
            Location = profile.Location,
            Website = profile.Website,
            Industry = profile.Industry,
            ContactEmail=profile.ContactEmail,
            ContactPhone = profile.ContactPhone
        };

    public async Task<bool> DeleteAsync(Guid companyProfileId)
    {
        var profile = await _context.CompanyProfiles.FirstOrDefaultAsync(p=>p.Id==companyProfileId);
        if (profile == null)
        {
            return false;
        }
        _context.CompanyProfiles.Remove(profile);
        await _context.SaveChangesAsync();
        return true;
    }
}
