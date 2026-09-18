using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizService.DTOs;
using QuizService.Interfaces;

namespace QuizService.Controllers;

[ApiController]
[Route("api/quiz")]
[Authorize]
public class QuizController : ControllerBase
{
    private readonly IQuizService _quizService;
    private readonly ICompanyService _companyService;
    public QuizController(IQuizService quizService, ICompanyService companyService)
    {
        _quizService = quizService;
        _companyService = companyService;
    }
    [HttpGet("jobs/{jobId:guid}/questions")]
    public async Task<IActionResult> GetQuestions(Guid jobId)
    {
        var questions = await _quizService.GetQuestionsAsync(jobId);
        return Ok(questions);
    }
    [HttpPost("jobs/{jobId:guid}/questions")]
    [Authorize(Roles = "Company")]
    public async Task<IActionResult> AddQuestion(Guid jobId, AddQuestionRequest request)
    {
        try
        {
            var companyProfileId = await _companyService.GetMyProfileIdAsync(
                GetAuthorizationHeader());

            var question = await _quizService.AddQuestionAsync(
                companyProfileId,
                jobId,
                request);
            return Ok(question);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpDelete("jobs/{jobId:guid}/questions/{questionId:guid}")]
    [Authorize(Roles = "Company")]
    public async Task<IActionResult> RemoveQuestion(Guid jobId, Guid questionId)
    {
        try
        {
            var companyProfileId = await _companyService.GetMyProfileIdAsync(
                GetAuthorizationHeader());

            var removed = await _quizService.RemoveQuestionAsync(
                companyProfileId,
                jobId,
                questionId);
            if (!removed) return NotFound(new { message = "Question not found." });
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet("applications/{applicationId:guid}/answers")]
    [Authorize(Roles = "Company")]
    public async Task<IActionResult> GetAnswers(Guid applicationId)
    {
        try
        {
            var authorizationHeader = GetAuthorizationHeader();
            var companyProfileId = await _companyService.GetMyProfileIdAsync(
                authorizationHeader);

            var answers = await _quizService.GetAnswersForApplicationAsync(
                companyProfileId,
                applicationId,
                authorizationHeader);
            return Ok(answers);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("applications/{applicationId:guid}/answers")]
    [Authorize(Roles = "Candidate")]
    public async Task<IActionResult> SubmitAnswers(
        Guid applicationId,
        List<SubmitAnswerRequest> answers)
    {
        try
        {
            await _quizService.SaveAnswersAsync(
                applicationId,
                answers,
                GetAuthorizationHeader());

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private string GetAuthorizationHeader()
    {
        var authorizationHeader = Request.Headers.Authorization.ToString();

        if (string.IsNullOrWhiteSpace(authorizationHeader))
        {
            throw new UnauthorizedAccessException("Missing authorization.");
        }

        return authorizationHeader;
    }
}
