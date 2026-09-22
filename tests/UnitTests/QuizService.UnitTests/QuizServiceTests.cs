using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using QuizService.Controllers;
using QuizService.DTOs;
using QuizService.Interfaces;

namespace QuizService.UnitTests;

public class QuizDtoValidationTests
{
    [Fact]
    public void AddQuestion_WithShortText_IsInvalid()
    {
        var dto = new AddQuestionRequest { QuestionText = "Why?", OrderIndex = 1 };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void AddQuestion_WithOrderIndexAbove100_IsInvalid()
    {
        var dto = new AddQuestionRequest
        {
            QuestionText = "Why are you interested in this position?",
            OrderIndex = 101
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void SubmitAnswer_WithoutText_IsInvalid()
    {
        var dto = new SubmitAnswerRequest { QuestionId = Guid.NewGuid(), Answer = string.Empty };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void SubmitAnswer_WithText_IsValid()
    {
        var dto = new SubmitAnswerRequest
        {
            QuestionId = Guid.NewGuid(),
            Answer = "I have experience with the required technologies."
        };

        Assert.True(IsValid(dto));
    }

    private static bool IsValid(object dto) => Validator.TryValidateObject(
        dto,
        new ValidationContext(dto),
        new List<ValidationResult>(),
        validateAllProperties: true);
}

public class QuizControllerTests
{
    private const string AuthorizationHeader = "Bearer test-token";

    [Fact]
    public async Task GetQuestions_ReturnsQuestionsFromService()
    {
        var jobId = Guid.NewGuid();
        var questions = new List<JobListingQuestionDto>
        {
            new() { Id = Guid.NewGuid(), QuestionText = "Why do you want this job?" }
        };
        var quizService = new Mock<IQuizService>();

        quizService.Setup(service => service.GetQuestionsAsync(jobId))
            .ReturnsAsync(questions);

        var result = await CreateController(quizService.Object, Mock.Of<ICompanyService>())
            .GetQuestions(jobId);

        Assert.Same(questions, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task AddQuestion_WithCompanyProfile_ReturnsOk()
    {
        var jobId = Guid.NewGuid();
        var companyProfileId = Guid.NewGuid();
        var request = new AddQuestionRequest { QuestionText = "Why do you want this job?", OrderIndex = 1 };
        var expected = new JobListingQuestionDto { Id = Guid.NewGuid(), QuestionText = request.QuestionText };
        var quizService = new Mock<IQuizService>();
        var companyService = new Mock<ICompanyService>();

        companyService.Setup(service => service.GetMyProfileIdAsync(AuthorizationHeader))
            .ReturnsAsync(companyProfileId);
        quizService.Setup(service => service.AddQuestionAsync(companyProfileId, jobId, request))
            .ReturnsAsync(expected);

        var result = await CreateController(quizService.Object, companyService.Object)
            .AddQuestion(jobId, request);

        Assert.Same(expected, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task RemoveQuestion_WhenQuestionDoesNotExist_ReturnsNotFound()
    {
        var companyProfileId = Guid.NewGuid();
        var quizService = new Mock<IQuizService>();
        var companyService = new Mock<ICompanyService>();

        companyService.Setup(service => service.GetMyProfileIdAsync(AuthorizationHeader))
            .ReturnsAsync(companyProfileId);
        quizService.Setup(service => service.RemoveQuestionAsync(
                companyProfileId, It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(false);

        var result = await CreateController(quizService.Object, companyService.Object)
            .RemoveQuestion(Guid.NewGuid(), Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task SubmitAnswers_CallsServiceAndReturnsNoContent()
    {
        var applicationId = Guid.NewGuid();
        var answers = new List<SubmitAnswerRequest>
        {
            new() { QuestionId = Guid.NewGuid(), Answer = "My answer." }
        };
        var quizService = new Mock<IQuizService>();

        quizService.Setup(service => service.SaveAnswersAsync(
                applicationId, answers, AuthorizationHeader))
            .Returns(Task.CompletedTask);

        var result = await CreateController(quizService.Object, Mock.Of<ICompanyService>())
            .SubmitAnswers(applicationId, answers);

        Assert.IsType<NoContentResult>(result);
    }

    private static QuizController CreateController(
        IQuizService quizService,
        ICompanyService companyService)
    {
        var controller = new QuizController(quizService, companyService);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
        controller.Request.Headers.Authorization = AuthorizationHeader;
        return controller;
    }
}
