using IdentityService.Controllers;
using IdentityService.DTOs.Auth;
using IdentityService.Enums;
using IdentityService.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace IdentityService.UnitTests;

public class AuthControllerTests
{
    [Fact]
    public async Task Register_WhenServiceSucceeds_ReturnsOk()
    {
        var authServiceMock = new Mock<IAuthService>();

        var dto = new RegisterDto
        {
            FirstName = "Ana",
            LastName = "Anić",
            Email = "ana@example.com",
            Password = "Password123!",
            Role = UserRole.Candidate
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "test-token",
            Email = dto.Email,
            Role = UserRole.Candidate
        };

        authServiceMock
            .Setup(service => service.RegisterAsync(dto))
            .ReturnsAsync(expectedResponse);

        var controller = new AuthController(
            authServiceMock.Object);

        var result = await controller.Register(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.Same(expectedResponse, okResult.Value);

        authServiceMock.Verify(
            service => service.RegisterAsync(dto),
            Times.Once);
    }

    [Fact]
    public async Task Register_WhenEmailAlreadyExists_ReturnsBadRequest()
    {
        var authServiceMock = new Mock<IAuthService>();

        var dto = new RegisterDto
        {
            FirstName = "Ana",
            LastName = "Anić",
            Email = "ana@example.com",
            Password = "Password123!",
            Role = UserRole.Candidate
        };

        authServiceMock
            .Setup(service => service.RegisterAsync(dto))
            .ThrowsAsync(
                new InvalidOperationException(
                    "User with this email already exists."));

        var controller = new AuthController(
            authServiceMock.Object);

        var result = await controller.Register(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Login_WhenCredentialsAreCorrect_ReturnsOk()
    {
        var authServiceMock = new Mock<IAuthService>();

        var dto = new LoginDto
        {
            Email = "ana@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "test-token",
            Email = dto.Email,
            Role = UserRole.Candidate
        };

        authServiceMock
            .Setup(service => service.LoginAsync(dto))
            .ReturnsAsync(expectedResponse);

        var controller = new AuthController(
            authServiceMock.Object);

        var result = await controller.Login(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.Same(expectedResponse, okResult.Value);
    }

    [Fact]
    public async Task Login_WhenCredentialsAreWrong_ReturnsBadRequest()
    {
        var authServiceMock = new Mock<IAuthService>();

        var dto = new LoginDto
        {
            Email = "ana@example.com",
            Password = "WrongPassword123!"
        };

        authServiceMock
            .Setup(service => service.LoginAsync(dto))
            .ThrowsAsync(
                new InvalidOperationException(
                    "Invalid email or password."));

        var controller = new AuthController(
            authServiceMock.Object);

        var result = await controller.Login(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Logout_CallsServiceAndReturnsOk()
    {
        var authServiceMock = new Mock<IAuthService>();

        authServiceMock
            .Setup(service => service.Logoutasync())
            .Returns(Task.CompletedTask);

        var controller = new AuthController(
            authServiceMock.Object);

        var result = await controller.Logout();

        Assert.IsType<OkObjectResult>(result);

        authServiceMock.Verify(
            service => service.Logoutasync(),
            Times.Once);
    }
}