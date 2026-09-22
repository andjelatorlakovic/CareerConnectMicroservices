using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using IdentityService.DTOs.Auth;
using IdentityService.Enums;

namespace IdentityService.IntegrationTests;

public class AuthIntegrationTests
    : IClassFixture<IdentityApiFactory>
{
    private readonly IdentityApiFactory _factory;

    public AuthIntegrationTests(IdentityApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_ThenLogin_ReturnsJwtToken()
    {
        await _factory.ResetDatabaseAsync();

        var client = _factory.CreateClient();

        var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterDto
            {
                FirstName = "Ana",
                LastName = "Anic",
                Email = "ana.integration@test.com",
                Password = "Password123",
                Role = UserRole.Candidate
            });

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

        var loginResponse = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginDto
            {
                Email = "ana.integration@test.com",
                Password = "Password123"
            });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        jsonOptions.Converters.Add(new JsonStringEnumConverter());

        var loginResult = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>(
            jsonOptions);

        Assert.NotNull(loginResult);
        Assert.False(string.IsNullOrWhiteSpace(loginResult.Token));
        Assert.Equal("ana.integration@test.com", loginResult.Email);
        Assert.Equal(UserRole.Candidate, loginResult.Role);
    }

    [Fact]
    public async Task Register_SameEmailTwice_ReturnsBadRequest()
    {
        await _factory.ResetDatabaseAsync();

        var client = _factory.CreateClient();

        var user = new RegisterDto
        {
            FirstName = "Ana",
            LastName = "Anic",
            Email = "duplicate@test.com",
            Password = "Password123",
            Role = UserRole.Candidate
        };

        var firstResponse =
            await client.PostAsJsonAsync("/api/auth/register", user);

        var secondResponse =
            await client.PostAsJsonAsync("/api/auth/register", user);

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsBadRequest()
    {
        await _factory.ResetDatabaseAsync();

        var client = _factory.CreateClient();

        await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterDto
            {
                FirstName = "Ana",
                LastName = "Anic",
                Email = "wrong-password@test.com",
                Password = "CorrectPassword123",
                Role = UserRole.Candidate
            });

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginDto
            {
                Email = "wrong-password@test.com",
                Password = "WrongPassword123"
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
