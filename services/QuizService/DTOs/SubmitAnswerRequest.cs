using System.ComponentModel.DataAnnotations;

namespace QuizService.DTOs;
public class SubmitAnswerRequest
{
    public Guid QuestionId { get; set; }
    [Required, StringLength(3000, MinimumLength = 1)]
    public string Answer { get; set; } = string.Empty;
}
