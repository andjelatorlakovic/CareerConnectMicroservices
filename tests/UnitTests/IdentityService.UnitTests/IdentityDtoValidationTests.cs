using System.ComponentModel.DataAnnotations;
using IdentityService.DTOs.Auth;
using IdentityService.DTOs.User;
using IdentityService.Enums;

namespace IdentityService.UnitTests;

public class IdentityDtoValidationTests
{
    [Fact]
    public void RegisterDto_WithoutEmail_IsInvalid()
    {
        var dto = new RegisterDto
        {
            FirstName = "Ana",
            LastName = "Anić",
            Email = "",
            Password = "Password123!",
            Role = UserRole.Candidate
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void RegisterDto_WithInvalidEmail_IsInvalid()
    {
        var dto = new RegisterDto
        {
            FirstName = "Ana",
            LastName = "Anić",
            Email = "nije-email",
            Password = "Password123!",
            Role = UserRole.Candidate
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void RegisterDto_WithShortPassword_IsInvalid()
    {
        var dto = new RegisterDto
        {
            FirstName = "Ana",
            LastName = "Anić",
            Email = "ana@example.com",
            Password = "123",
            Role = UserRole.Candidate
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void RegisterDto_WithOneCharacterFirstName_IsInvalid()
    {
        var dto = new RegisterDto
        {
            FirstName = "A",
            LastName = "Anić",
            Email = "ana@example.com",
            Password = "Password123!",
            Role = UserRole.Candidate
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void RegisterDto_WithValidCompanyWithoutNames_IsValid()
    {
        var dto = new RegisterDto
        {
            FirstName = null,
            LastName = null,
            Email = "company@example.com",
            Password = "Password123!",
            Role = UserRole.Company
        };

        Assert.True(IsValid(dto));
    }

    [Fact]
    public void LoginDto_WithInvalidEmail_IsInvalid()
    {
        var dto = new LoginDto
        {
            Email = "pogresan-email",
            Password = "Password123!"
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void LoginDto_WithShortPassword_IsInvalid()
    {
        var dto = new LoginDto
        {
            Email = "ana@example.com",
            Password = "123"
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void ChangePasswordRequest_WithShortNewPassword_IsInvalid()
    {
        var dto = new ChangePasswordRequest
        {
            CurrentPassword = "Password123!",
            NewPassword = "123"
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void UpdateUserRequest_WithInvalidEmail_IsInvalid()
    {
        var dto = new UpdateUserRequest
        {
            FirstName = "Ana",
            LastName = "Anić",
            Email = "pogresan-email"
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void UpdateUserRequest_WithValidValues_IsValid()
    {
        var dto = new UpdateUserRequest
        {
            FirstName = "Ana",
            LastName = "Anić",
            Email = "ana@example.com"
        };

        Assert.True(IsValid(dto));
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
    [Fact]
public void ChangePasswordRequest_WithoutCurrentPassword_IsInvalid()
{
    var dto = new ChangePasswordRequest
    {
        CurrentPassword = "",
        NewPassword = "NewPassword123!"
    };

    Assert.False(IsValid(dto));
}

[Fact]
public void ChangePasswordRequest_WithValidPasswords_IsValid()
{
    var dto = new ChangePasswordRequest
    {
        CurrentPassword = "OldPassword123!",
        NewPassword = "NewPassword123!"
    };

    Assert.True(IsValid(dto));
}

[Fact]
public void UpdateUserRequest_WithoutFirstName_IsInvalid()
{
    var dto = new UpdateUserRequest
    {
        FirstName = "",
        LastName = "Anić",
        Email = "ana@example.com"
    };

    Assert.False(IsValid(dto));
}
}