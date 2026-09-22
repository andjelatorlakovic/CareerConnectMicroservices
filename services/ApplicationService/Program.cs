using System.Text;
using System.Text.Json.Serialization;
using ApplicationService.Data;
using ApplicationService.Interfaces;
using ApplicationService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString(
        "DefaultConnection")));

builder.Services.AddScoped<IJobApplicationService, JobApplicationService>();

builder.Services.AddHttpClient<ICandidateService, CandidateService>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["ServiceUrls:CandidateService"]
        ?? throw new InvalidOperationException(
            "Candidate service URL is not configured."));
});

builder.Services.AddHttpClient<ICompanyService, CompanyService>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["ServiceUrls:CompanyService"]
        ?? throw new InvalidOperationException(
            "Company service URL is not configured."));
});

builder.Services.AddHttpClient<IQuizService, QuizService>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["ServiceUrls:QuizService"]
        ?? throw new InvalidOperationException(
            "Quiz service URL is not configured."));
});

builder.Services.AddHttpClient<
    INotificationService,
    global::ApplicationService.Services.NotificationService>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["ServiceUrls:NotificationService"]
        ?? throw new InvalidOperationException(
            "Notification service URL is not configured."));
});

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrations"))
{
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<ApplicationDbContext>()
        .Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    var exception = context.Features
        .Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()
        ?.Error;

    context.Response.StatusCode = exception is ArgumentException or InvalidOperationException
        ? StatusCodes.Status400BadRequest
        : StatusCodes.Status500InternalServerError;
    await context.Response.WriteAsJsonAsync(new
    {
        message = exception is ArgumentException or InvalidOperationException
            ? exception.Message
            : "An unexpected server error occurred."
    });
}));
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

public partial class Program
{
}
