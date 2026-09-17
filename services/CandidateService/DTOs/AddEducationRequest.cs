using System.ComponentModel.DataAnnotations;

namespace CandidateService.DTOs;
public class AddEducationRequest
{
    [Required, StringLength(150, MinimumLength = 2)]
    public string Institution { get; set; } = string.Empty;
    [Required, StringLength(150, MinimumLength = 2)]
    public string Degree { get; set; } = string.Empty;
    [Required, StringLength(150, MinimumLength = 2)]
    public string FieldOfStudy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
