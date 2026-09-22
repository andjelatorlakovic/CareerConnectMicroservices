using System.Security.Claims;
using CandidateService.Controllers;
using CandidateService.DTOs;
using CandidateService.Enums;
using CandidateService.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;

namespace CandidateService.UnitTests;

public class CandidateControllerTests
{
    [Fact]
    public async Task Get_WithExistingProfile_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        var serviceMock = new Mock<ICandidateService>();

        var profile = new CandidateProfileDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Bio = "A valid candidate profile description.",
            Location = "Novi Sad",
            ExperienceLevel = ExperienceLevel.Junior
        };

        serviceMock
            .Setup(service => service.GetOrCreateAsync(userId))
            .ReturnsAsync(profile);

        var controller = CreateController(serviceMock.Object, userId);

        var result = await controller.Get();

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.Same(profile, okResult.Value);
    }

    [Fact]
    public async Task Update_WithValidProfile_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        var serviceMock = new Mock<ICandidateService>();

        var request = new UpdateCandidateProfileRequest
        {
            Bio =
                "I am a junior developer interested in backend development.",
            Location = "Novi Sad",
            ExperienceLevel = ExperienceLevel.Junior,
            Skills = new List<Skill> { Skill.CSharp },
            DesiredJobCategories = new List<JobCategory>
            {
                JobCategory.SoftwareDevelopment
            }
        };

        var updatedProfile = new CandidateProfileDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Bio = request.Bio,
            Location = request.Location,
            ExperienceLevel = request.ExperienceLevel
        };

        serviceMock
            .Setup(service =>
                service.UpdateCandidateProfileAsync(userId, request))
            .ReturnsAsync(updatedProfile);

        var controller = CreateController(serviceMock.Object, userId);

        var result = await controller.Update(request);

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.Same(updatedProfile, okResult.Value);

        serviceMock.Verify(
            service =>
                service.UpdateCandidateProfileAsync(userId, request),
            Times.Once);
    }

    [Fact]
    public async Task DeleteEducation_WhenEducationDoesNotExist_ReturnsNotFound()
    {
        var userId = Guid.NewGuid();
        var educationId = Guid.NewGuid();
        var serviceMock = new Mock<ICandidateService>();

        serviceMock
            .Setup(service =>
                service.RemoveEducationAsync(userId, educationId))
            .ReturnsAsync(false);

        var controller = CreateController(serviceMock.Object, userId);

        var result = await controller.DeleteEducation(educationId);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetUserIdForInternalService_WithWrongKey_ReturnsUnauthorized()
    {
        var serviceMock = new Mock<ICandidateService>();
        var controller = CreateController(
            serviceMock.Object,
            Guid.NewGuid());

        var configuration = CreateConfiguration("correct-key");

        var result = await controller.GetUserIdForInternalService(
            Guid.NewGuid(),
            "wrong-key",
            configuration);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetUserIdForInternalService_WithCorrectKey_ReturnsOk()
    {
        var profileId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var serviceMock = new Mock<ICandidateService>();

        serviceMock
            .Setup(service =>
                service.GetUserIdByProfileIdAsync(profileId))
            .ReturnsAsync(userId);

        var controller = CreateController(
            serviceMock.Object,
            Guid.NewGuid());

        var configuration = CreateConfiguration("correct-key");

        var result = await controller.GetUserIdForInternalService(
            profileId,
            "correct-key",
            configuration);

        Assert.IsType<OkObjectResult>(result);

        serviceMock.Verify(
            service =>
                service.GetUserIdByProfileIdAsync(profileId),
            Times.Once);
    }

    private static CandidateController CreateController(
        ICandidateService service,
        Guid userId)
    {
        var controller = new CandidateController(service);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(
                    new ClaimsIdentity(
                        new[]
                        {
                            new Claim(
                                ClaimTypes.NameIdentifier,
                                userId.ToString())
                        },
                        "TestAuthentication"))
            }
        };

        return controller;
    }

    private static IConfiguration CreateConfiguration(string apiKey)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["InternalApiKey"] = apiKey
                })
            .Build();
    }
}