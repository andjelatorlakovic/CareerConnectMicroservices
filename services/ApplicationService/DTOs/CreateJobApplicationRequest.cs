using System.ComponentModel.DataAnnotations;

namespace ApplicationService.DTOs;
public class CreateJobApplicationRequest
{
    [StringLength(3000)]
    public string CoverLetter { get; set; } = string.Empty;
    public List<SubmitAnswerRequest> Answers { get; set; } = new();
}
