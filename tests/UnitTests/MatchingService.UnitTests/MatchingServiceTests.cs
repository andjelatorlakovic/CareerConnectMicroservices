using MatchingService.Contracts;
using MatchingService.Controllers;
using MatchingService.DTOs;
using MatchingService.Interfaces;
using MatchingService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace MatchingService.UnitTests;

public class MatchingServiceTests
{
    private const string AuthorizationHeader = "Bearer test-token";

    [Fact]
    public async Task GetMatchingJobs_CalculatesMatchPercentage()
    {
        var candidateService = new Mock<ICandidateService>();
        var companyService = new Mock<ICompanyService>();
        var jobId = Guid.NewGuid();

        candidateService.Setup(service => service.GetMyProfileAsync(AuthorizationHeader))
            .ReturnsAsync(new CandidateProfileDto
            {
                Skills = ["CSharp", "SQL"],
                DesiredJobCategories = ["SoftwareDevelopment"]
            });

        companyService.Setup(service => service.GetJobsAsync(AuthorizationHeader))
            .ReturnsAsync(
            [
                new JobListingDto
                {
                    Id = jobId,
                    Title = "Backend Developer",
                    Location = "Novi Sad",
                    JobCategory = "SoftwareDevelopment",
                    Status = "Active",
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    Skills = ["CSharp", "SQL", "React"]
                }
            ]);

        var service = new MatchingService.Services.MatchingService(
            candidateService.Object,
            companyService.Object);

        var results = await service.GetMatchingJobsAsync(AuthorizationHeader);

        var result = Assert.Single(results);
        Assert.Equal(jobId, result.JobId);
        Assert.Equal(66.67m, result.MatchPercentage);
        Assert.Equal(["CSharp", "SQL"], result.MatchedSkills);
        Assert.Equal(["React"], result.MissingSkills);
    }

    [Fact]
    public async Task GetMatchingJobs_ExcludesClosedExpiredAndWrongCategoryJobs()
    {
        var candidateService = new Mock<ICandidateService>();
        var companyService = new Mock<ICompanyService>();

        candidateService.Setup(service => service.GetMyProfileAsync(AuthorizationHeader))
            .ReturnsAsync(new CandidateProfileDto
            {
                Skills = ["CSharp"],
                DesiredJobCategories = ["SoftwareDevelopment"]
            });

        companyService.Setup(service => service.GetJobsAsync(AuthorizationHeader))
            .ReturnsAsync(
            [
                new JobListingDto
                {
                    Status = "Closed",
                    JobCategory = "SoftwareDevelopment",
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    Skills = ["CSharp"]
                },
                new JobListingDto
                {
                    Status = "Active",
                    JobCategory = "SoftwareDevelopment",
                    ExpiresAt = DateTime.UtcNow.AddDays(-1),
                    Skills = ["CSharp"]
                },
                new JobListingDto
                {
                    Status = "Active",
                    JobCategory = "Marketing",
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    Skills = ["CSharp"]
                }
            ]);

        var service = new MatchingService.Services.MatchingService(
            candidateService.Object,
            companyService.Object);

        var results = await service.GetMatchingJobsAsync(AuthorizationHeader);

        Assert.Empty(results);
    }
}

public class MatchingControllerTests
{
    [Fact]
    public async Task GetMatchingJobs_WithoutAuthorizationHeader_ReturnsUnauthorized()
    {
        var controller = CreateController(Mock.Of<IMatchingService>(), null);

        var result = await controller.GetMatchingJobs();

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetMatchingJobs_WithAuthorizationHeader_ReturnsResults()
    {
        const string authorizationHeader = "Bearer test-token";
        var matchingService = new Mock<IMatchingService>();
        var expected = new List<MatchResultDto> { new() { JobId = Guid.NewGuid(), MatchPercentage = 100 } };

        matchingService.Setup(service => service.GetMatchingJobsAsync(authorizationHeader))
            .ReturnsAsync(expected);

        var result = await CreateController(matchingService.Object, authorizationHeader)
            .GetMatchingJobs();

        Assert.Same(expected, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task GetMatchingJobs_WhenServiceFails_ReturnsBadRequest()
    {
        const string authorizationHeader = "Bearer test-token";
        var matchingService = new Mock<IMatchingService>();
        matchingService.Setup(service => service.GetMatchingJobsAsync(authorizationHeader))
            .ThrowsAsync(new InvalidOperationException("Candidate profile not found."));

        var result = await CreateController(matchingService.Object, authorizationHeader)
            .GetMatchingJobs();

        Assert.IsType<BadRequestObjectResult>(result);
    }

    private static MatchingController CreateController(
        IMatchingService matchingService,
        string? authorizationHeader)
    {
        var controller = new MatchingController(matchingService);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        if (authorizationHeader is not null)
        {
            controller.Request.Headers.Authorization = authorizationHeader;
        }

        return controller;
    }
}
