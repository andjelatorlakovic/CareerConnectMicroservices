namespace QuizService.DTOs;
public class JobListingQuestionDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string QuestionText { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}
