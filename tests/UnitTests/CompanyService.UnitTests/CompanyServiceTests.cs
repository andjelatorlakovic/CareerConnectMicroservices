using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using CompanyService.Controllers;
using CompanyService.DTOs.CompanyProfile;
using CompanyService.DTOs.JobListing;
using CompanyService.Enums;
using CompanyService.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CompanyService.UnitTests;

public class CompanyDtoValidationTests
{
    [Fact]
    public void UpdateCompanyProfile_WithoutWebsite_IsValid()
    {
        var dto = CreateValidCompanyProfile();
        dto.Website = null;

        Assert.True(IsValid(dto));
    }

    [Fact]
    public void UpdateCompanyProfile_WithInvalidWebsite_IsInvalid()
    {
        var dto = CreateValidCompanyProfile();
        dto.Website = "not-a-url";

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void UpdateCompanyProfile_WithShortDescription_IsInvalid()
    {
        var dto = CreateValidCompanyProfile();
        dto.Description = "Too short";

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void CreateJobListing_WithoutSkills_IsInvalid()
    {
        var dto = CreateValidJobRequest();
        dto.Skills = [];

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void CreateJobListing_WithNegativeSalary_IsInvalid()
    {
        var dto = CreateValidJobRequest();
        dto.SalaryMin = -1;

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void UpdateJobListing_WithoutTitle_IsInvalid()
    {
        var dto = new UpdateJobListingRequest
        {
            Title = "",
            Description = "This is a valid description for an updated job listing.",
            Location = "Novi Sad",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            Skills = [Skill.CSharp]
        };

        Assert.False(IsValid(dto));
    }

    private static UpdateCompanyProfileDto CreateValidCompanyProfile() => new()
    {
        Name = "Test Company",
        Description = "This is a sufficiently detailed company description.",
        Location = "Novi Sad",
        Website = "https://example.com",
        Industry = "Information Technology",
        ContactEmail = "contact@example.com",
        ContactPhone = "+38160123456"
    };

    private static CreateJobListingRequest CreateValidJobRequest() => new()
    {
        Title = "Backend Developer",
        Description = "This is a sufficiently detailed job description for testing.",
        Location = "Novi Sad",
        ExpiresAt = DateTime.UtcNow.AddDays(7),
        Skills = [Skill.CSharp],
        SalaryMin = 1000,
        SalaryMax = 1500
    };

    private static bool IsValid(object dto)
    {
        return Validator.TryValidateObject(
            dto,
            new ValidationContext(dto),
            new List<ValidationResult>(),
            validateAllProperties: true);
    }
}

public class CompanyControllerTests
{
    [Fact]
    public async Task GetProfile_ReturnsProfileForCurrentCompany()
    {
        var userId = Guid.NewGuid();
        var service = new Mock<ICompanyService>();
        var profile = new CompanyProfileDto { Id = Guid.NewGuid(), UserId = userId };

        service.Setup(item => item.GetOrCreateAsync(userId)).ReturnsAsync(profile);

        var result = await CreateController(service.Object, userId)
            .GetOrCreateCompanyProfile();

        Assert.Same(profile, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task UpdateProfile_WhenServiceRejectsRequest_ReturnsBadRequest()
    {
        var userId = Guid.NewGuid();
        var service = new Mock<ICompanyService>();
        var dto = new UpdateCompanyProfileDto();

        service.Setup(item => item.UpdateCompanyProfileAsync(userId, dto))
            .ThrowsAsync(new InvalidOperationException("Invalid profile."));

        var result = await CreateController(service.Object, userId)
            .UpdateCompanyProfile(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    private static CompanyController CreateController(ICompanyService service, Guid userId)
    {
        var controller = new CompanyController(service);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.NameIdentifier, userId.ToString())],
                    "TestAuthentication"))
            }
        };
        return controller;
    }
}

public class JobListingControllerTests
{
    [Fact]
    public async Task GetAll_ReturnsJobsFromService()
    {
        var jobService = new Mock<IJobService>();
        var companyService = new Mock<ICompanyService>();
        var jobs = new List<JobListingDto> { new() { Id = Guid.NewGuid(), Title = "Developer" } };

        jobService.Setup(service => service.GetAllAsync(null, null, It.IsAny<List<Skill>>()))
            .ReturnsAsync(jobs);

        var result = await new JobListingController(jobService.Object, companyService.Object)
            .GetAll(null, null, null);

        Assert.Same(jobs, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task Create_WithCompanyProfile_ReturnsCreated()
    {
        var userId = Guid.NewGuid();
        var profile = new CompanyProfileDto { Id = Guid.NewGuid(), UserId = userId };
        var request = new CreateJobListingRequest { Title = "Developer" };
        var createdJob = new JobListingDto { Id = Guid.NewGuid(), Title = request.Title };
        var jobService = new Mock<IJobService>();
        var companyService = new Mock<ICompanyService>();

        companyService.Setup(service => service.GetOrCreateAsync(userId)).ReturnsAsync(profile);
        jobService.Setup(service => service.CreateAsync(profile.Id, request)).ReturnsAsync(createdJob);

        var controller = CreateController(jobService.Object, companyService.Object, userId);
        var result = await controller.Create(request);

        Assert.Same(createdJob, Assert.IsType<CreatedAtActionResult>(result).Value);
    }

    [Fact]
    public async Task GetById_WhenJobDoesNotExist_ReturnsNotFound()
    {
        var jobService = new Mock<IJobService>();
        jobService.Setup(service => service.GetByIdAsync(It.IsAny<Guid>()))
            .ThrowsAsync(new InvalidOperationException("Not found."));

        var result = await new JobListingController(jobService.Object, Mock.Of<ICompanyService>())
            .GetById(Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Close_WhenJobDoesNotBelongToCompany_ReturnsNotFound()
    {
        var userId = Guid.NewGuid();
        var profile = new CompanyProfileDto { Id = Guid.NewGuid(), UserId = userId };
        var jobService = new Mock<IJobService>();
        var companyService = new Mock<ICompanyService>();

        companyService.Setup(service => service.GetOrCreateAsync(userId)).ReturnsAsync(profile);
        jobService.Setup(service => service.CloseAsync(profile.Id, It.IsAny<Guid>()))
            .ReturnsAsync(false);

        var result = await CreateController(jobService.Object, companyService.Object, userId)
            .Close(Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    private static JobListingController CreateController(
        IJobService jobService,
        ICompanyService companyService,
        Guid userId)
    {
        var controller = new JobListingController(jobService, companyService);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.NameIdentifier, userId.ToString())],
                    "TestAuthentication"))
            }
        };
        return controller;
    }
}
