using System.Security.Claims;
using IdentityService.Controllers;
using IdentityService.DTOs.User;
using IdentityService.Enums;
using IdentityService.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace IdentityService.UnitTests;

public class UserControllerTests
{
    [Fact]
    public async Task GetMe_WithExistingUser_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        var userServiceMock = new Mock<IUserService>();

        var expectedUser = new UserDto
        {
            Id = userId,
            FirstName = "Ana",
            LastName = "Anić",
            Email = "ana@example.com",
            Role = UserRole.Candidate,
            IsActive = true
        };

        userServiceMock
            .Setup(service => service.GetByIdAsync(userId))
            .ReturnsAsync(expectedUser);

        var controller = CreateController(
            userServiceMock.Object,
            userId);

        var result = await controller.GetMe();

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.Same(expectedUser, okResult.Value);
    }

    [Fact]
    public async Task UpdateMe_WithValidRequest_ReturnsUpdatedUser()
    {
        var userId = Guid.NewGuid();
        var userServiceMock = new Mock<IUserService>();

        var request = new UpdateUserRequest
        {
            FirstName = "Ana",
            LastName = "Anić",
            Email = "novo@example.com"
        };

        var updatedUser = new UserDto
        {
            Id = userId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Role = UserRole.Candidate,
            IsActive = true
        };

        userServiceMock
            .Setup(service => service.UpdateAsync(userId, request))
            .ReturnsAsync(updatedUser);

        var controller = CreateController(
            userServiceMock.Object,
            userId);

        var result = await controller.UpdateMe(request);

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.Same(updatedUser, okResult.Value);

        userServiceMock.Verify(
            service => service.UpdateAsync(userId, request),
            Times.Once);
    }

    [Fact]
    public async Task ChangePassword_WithCorrectPassword_ReturnsNoContent()
    {
        var userId = Guid.NewGuid();
        var userServiceMock = new Mock<IUserService>();

        var request = new ChangePasswordRequest
        {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword123!"
        };

        userServiceMock
            .Setup(service => service.ChangePasswordAsync(userId, request))
            .Returns(Task.CompletedTask);

        var controller = CreateController(
            userServiceMock.Object,
            userId);

        var result = await controller.ChangePassword(request);

        Assert.IsType<NoContentResult>(result);

        userServiceMock.Verify(
            service => service.ChangePasswordAsync(userId, request),
            Times.Once);
    }

    [Fact]
    public async Task ChangePassword_WithWrongCurrentPassword_ReturnsBadRequest()
    {
        var userId = Guid.NewGuid();
        var userServiceMock = new Mock<IUserService>();

        var request = new ChangePasswordRequest
        {
            CurrentPassword = "WrongPassword123!",
            NewPassword = "NewPassword123!"
        };

        userServiceMock
            .Setup(service => service.ChangePasswordAsync(userId, request))
            .ThrowsAsync(
                new InvalidOperationException(
                    "Current password is incorrect."));

        var controller = CreateController(
            userServiceMock.Object,
            userId);

        var result = await controller.ChangePassword(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task DeactivateUser_WithExistingUser_ReturnsNoContent()
    {
        var userServiceMock = new Mock<IUserService>();
        var adminId = Guid.NewGuid();
        var userToDeactivateId = Guid.NewGuid();

        userServiceMock
            .Setup(service =>
                service.DeactivateUserAsync(userToDeactivateId))
            .Returns(Task.CompletedTask);

        var controller = CreateController(
            userServiceMock.Object,
            adminId);

        var result = await controller.DeactivateUser(
            userToDeactivateId);

        Assert.IsType<NoContentResult>(result);

        userServiceMock.Verify(
            service =>
                service.DeactivateUserAsync(userToDeactivateId),
            Times.Once);
    }

    private static UserController CreateController(
        IUserService userService,
        Guid userId)
    {
        var controller = new UserController(userService);

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
}