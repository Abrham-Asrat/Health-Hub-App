using System.ComponentModel.DataAnnotations;
using HealthHub.Source.Attributes;
using HealthHub.Source.Models.Interfaces;

namespace HealthHub.Source.Models.Dtos;

public class ReviewProfileDto : IProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ProfilePicture { get; set; } = string.Empty;
}

public record ReviewDto
{
  public required Guid ReviewId { get; set; }
  public required Guid DoctorId { get; set; }
  public required Guid PatientId { get; set; }
  public required decimal StarRating { get; set; }
  public required string ReviewText { get; set; }
  public required DateTime CreatedAt { get; set; }
  public required DateTime? UpdatedAt { get; set; }
  public required IProfileDto Doctor { get; set; }
  public required IProfileDto Patient { get; set; }
};

public record CreateReviewDto
{
  [Required]
  public required Guid DoctorId { get; set; }

  [Required]
  public required Guid PatientId { get; set; }

  [Required]
  [StarRating]
  [Range(0, 5)]
  public required decimal StarRating { get; set; }

  [Required]
  [MinLength(10)]
  [MaxLength(1000)]
  public required string ReviewText { get; set; }
};

public record EditReviewDto
{
  [Required]
  public required Guid ReviewId { get; set; }

  [Required]
  [StarRating]
  [Range(0, 5)]
  public required decimal StarRating { get; set; }

  [Required]
  [MinLength(10)]
  [MaxLength(1000)]
  public required string ReviewText { get; set; }
};
