namespace QuizService.Models;
public class QuizAnswer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobApplicationId { get; set; }
    public Guid JobListingQuestionId { get; set; }
    public string Answer { get; set; } = string.Empty;

    public QuizAnswer()
    {
    }
    public QuizAnswer(Guid jobApplicationId, Guid jobListingQuestionId, string answer)
    {
        Id = Guid.NewGuid();
        JobApplicationId = jobApplicationId;
        JobListingQuestionId = jobListingQuestionId;
        Answer = answer;
    }
}
