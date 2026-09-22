using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace QuizService.IntegrationTests;

internal static class TestJwt
{
    private const string Key =
        "integration_test_jwt_key_must_contain_at_least_32_characters";

    public static string Create(Guid userId, string role) =>
        new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            issuer: "CareerConnectTests",
            audience: "CareerConnectTests",
            claims:
            [
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            ],
            expires: DateTime.UtcNow.AddMinutes(10),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(Key)),
                SecurityAlgorithms.HmacSha256)));
}
