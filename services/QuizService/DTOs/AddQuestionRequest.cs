using System.ComponentModel.DataAnnotations;

namespace QuizService.DTOs;
public class AddQuestionRequest
{
    [Required, StringLength(1000, MinimumLength = 5)]
    public string QuestionText { get; set; } = string.Empty;

    [Range(0, 100)]
    public int OrderIndex { get; set; }
}
