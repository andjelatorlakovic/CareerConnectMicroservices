using System.ComponentModel.DataAnnotations;
using CandidateService.DTOs;
using CandidateService.Enums;

namespace CandidateService.UnitTests;

public class CandidateDtoValidationTests
{
    [Fact]
    public void UpdateCandidateProfileRequest_WithShortBio_IsInvalid()
    {
        var dto = CreateValidProfileRequest();
        dto.Bio = "Too short";

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void UpdateCandidateProfileRequest_WithoutSkills_IsInvalid()
    {
        var dto = CreateValidProfileRequest();
        dto.Skills = new List<Skill>();

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void UpdateCandidateProfileRequest_WithoutDesiredCategories_IsInvalid()
    {
        var dto = CreateValidProfileRequest();
        dto.DesiredJobCategories = new List<JobCategory>();

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void UpdateCandidateProfileRequest_WithValidValues_IsValid()
    {
        var dto = CreateValidProfileRequest();

        Assert.True(IsValid(dto));
    }

    [Fact]
    public void AddEducationRequest_WithoutInstitution_IsInvalid()
    {
        var dto = new AddEducationRequest
        {
            Institution = "",
            Degree = "Bachelor degree",
            FieldOfStudy = "Software Engineering",
            StartDate = new DateTime(2020, 10, 1),
            EndDate = new DateTime(2024, 7, 1)
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void AddEducationRequest_WithValidValues_IsValid()
    {
        var dto = new AddEducationRequest
        {
            Institution = "Faculty of Technical Sciences",
            Degree = "Bachelor degree",
            FieldOfStudy = "Software Engineering",
            StartDate = new DateTime(2020, 10, 1),
            EndDate = new DateTime(2024, 7, 1)
        };

        Assert.True(IsValid(dto));
    }

    [Fact]
    public void AddWorkExperienceRequest_WithoutCompany_IsInvalid()
    {
        var dto = new AddWorkExperienceRequest
        {
            Company = "",
            Position = "Junior Developer",
            Description = "Developed web applications.",
            StartDate = new DateTime(2024, 1, 1)
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void AddWorkExperienceRequest_WithTooLongDescription_IsInvalid()
    {
        var dto = new AddWorkExperienceRequest
        {
            Company = "Example Company",
            Position = "Junior Developer",
            Description = new string('a', 2001),
            StartDate = new DateTime(2024, 1, 1)
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void AddWorkExperienceRequest_WithValidValues_IsValid()
    {
        var dto = new AddWorkExperienceRequest
        {
            Company = "Example Company",
            Position = "Junior Developer",
            Description = "Developed web applications.",
            StartDate = new DateTime(2024, 1, 1),
            EndDate = new DateTime(2025, 1, 1)
        };

        Assert.True(IsValid(dto));
    }

    private static UpdateCandidateProfileRequest
        CreateValidProfileRequest()
    {
        return new UpdateCandidateProfileRequest
        {
            Bio =
                "I am a junior developer interested in backend development.",
            Location = "Novi Sad",
            ExperienceLevel = ExperienceLevel.Junior,
            Skills = new List<Skill>
            {
                Skill.CSharp,
                Skill.SQL
            },
            DesiredJobCategories = new List<JobCategory>
            {
                JobCategory.SoftwareDevelopment
            }
        };
    }

    private static bool IsValid(object dto)
    {
        var context = new ValidationContext(dto);
        var validationResults = new List<ValidationResult>();

        return Validator.TryValidateObject(
            dto,
            context,
            validationResults,
            validateAllProperties: true);
    }
}