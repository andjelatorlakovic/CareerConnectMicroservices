namespace QuizService.Models;
public class JobListingQuestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobListingId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int OrderIndex { get; set; } 

    public JobListingQuestion()
    {
    }

    public JobListingQuestion(Guid jobListingId, string questionText, int orderIndex)
    {
        Id = Guid.NewGuid();
        JobListingId = jobListingId;
        QuestionText = questionText;
        OrderIndex = orderIndex;
    }
}
