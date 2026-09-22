using System.ComponentModel.DataAnnotations;
using ApplicationService.Controllers;
using ApplicationService.DTOs;
using ApplicationService.Enums;
using ApplicationService.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace ApplicationService.UnitTests;

public class ApplicationDtoValidationTests
{
    [Fact]
    public void CreateApplication_WithTooLongCoverLetter_IsInvalid()
    {
        var dto = new CreateJobApplicationRequest
        {
            CoverLetter = new string('a', 3001)
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void SubmitAnswer_WithoutAnswerText_IsInvalid()
    {
        var dto = new SubmitAnswerRequest
        {
            QuestionId = Guid.NewGuid(),
            Answer = string.Empty
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void SubmitAnswer_WithAnswerText_IsValid()
    {
        var dto = new SubmitAnswerRequest
        {
            QuestionId = Guid.NewGuid(),
            Answer = "I have relevant experience."
        };

        Assert.True(IsValid(dto));
    }

    private static bool IsValid(object dto) => Validator.TryValidateObject(
        dto,
        new ValidationContext(dto),
        new List<ValidationResult>(),
        validateAllProperties: true);
}

public class JobApplicationControllerTests
{
    private const string AuthorizationHeader = "Bearer test-token";

    [Fact]
    public async Task Apply_WithCandidateProfile_ReturnsOk()
    {
        var candidateProfileId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var request = new CreateJobApplicationRequest { CoverLetter = "My application." };
        var expected = new JobApplicationDto { Id = Guid.NewGuid(), JobListingId = jobId };
        var applicationService = new Mock<IJobApplicationService>();
        var candidateService = new Mock<ICandidateService>();

        candidateService.Setup(service => service.GetMyProfileIdAsync(AuthorizationHeader))
            .ReturnsAsync(candidateProfileId);
        applicationService.Setup(service => service.ApplyJobApplicationAsync(
                candidateProfileId, jobId, request, AuthorizationHeader))
            .ReturnsAsync(expected);

        var result = await CreateController(
                applicationService.Object,
                candidateService.Object,
                Mock.Of<ICompanyService>())
            .Apply(jobId, request);

        Assert.Same(expected, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task Apply_WhenServiceRejectsApplication_ReturnsBadRequest()
    {
        var jobId = Guid.NewGuid();
        var request = new CreateJobApplicationRequest();
        var applicationService = new Mock<IJobApplicationService>();
        var candidateService = new Mock<ICandidateService>();

        candidateService.Setup(service => service.GetMyProfileIdAsync(AuthorizationHeader))
            .ReturnsAsync(Guid.NewGuid());
        applicationService.Setup(service => service.ApplyJobApplicationAsync(
                It.IsAny<Guid>(), jobId, request, AuthorizationHeader))
            .ThrowsAsync(new InvalidOperationException("Already applied."));

        var result = await CreateController(
                applicationService.Object,
                candidateService.Object,
                Mock.Of<ICompanyService>())
            .Apply(jobId, request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GetMyApplications_ReturnsApplicationsForCurrentCandidate()
    {
        var candidateProfileId = Guid.NewGuid();
        var applications = new List<JobApplicationDto> { new() { Id = Guid.NewGuid() } };
        var applicationService = new Mock<IJobApplicationService>();
        var candidateService = new Mock<ICandidateService>();

        candidateService.Setup(service => service.GetMyProfileIdAsync(AuthorizationHeader))
            .ReturnsAsync(candidateProfileId);
        applicationService.Setup(service => service.GetMyApplicationsAsync(candidateProfileId))
            .ReturnsAsync(applications);

        var result = await CreateController(
                applicationService.Object,
                candidateService.Object,
                Mock.Of<ICompanyService>())
            .GetMyApplications();

        Assert.Same(applications, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task UpdateStatus_WithCompanyProfile_ReturnsOk()
    {
        var companyProfileId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();
        var request = new UpdateJobApplicationRequest { Status = ApplicationStatus.Accepted };
        var expected = new JobApplicationDto { Id = applicationId, Status = ApplicationStatus.Accepted };
        var applicationService = new Mock<IJobApplicationService>();
        var companyService = new Mock<ICompanyService>();

        companyService.Setup(service => service.GetMyProfileIdAsync(AuthorizationHeader))
            .ReturnsAsync(companyProfileId);
        applicationService.Setup(service => service.UpdateStatusAsync(
                companyProfileId, applicationId, request))
            .ReturnsAsync(expected);

        var result = await CreateController(
                applicationService.Object,
                Mock.Of<ICandidateService>(),
                companyService.Object)
            .UpdateStatus(applicationId, request);

        Assert.Same(expected, Assert.IsType<OkObjectResult>(result).Value);
    }

    private static JobApplicationController CreateController(
        IJobApplicationService applicationService,
        ICandidateService candidateService,
        ICompanyService companyService)
    {
        var controller = new JobApplicationController(
            applicationService,
            candidateService,
            companyService);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
        controller.Request.Headers.Authorization = AuthorizationHeader;

        return controller;
    }
}
