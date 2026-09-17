namespace QuizService.DTOs;
public class QuizAnswerDto
{
    public Guid QuestionId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
}
