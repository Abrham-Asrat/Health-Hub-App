using System.ComponentModel.DataAnnotations;
using HealthHub.Source.Attributes;

namespace HealthHub.Source.Models.Entities;

public class Review : BaseEntity
{
  public Guid ReviewId { get; set; } = Guid.NewGuid();

  [Required]
  public Guid DoctorId { get; set; } // <<FK>>

  [Required]
  public Guid PatientId { get; set; } // <<FK>>

  [Required]
  [StarRating]
  [Range(0, 5)]
  public decimal StarRating { get; set; }

  [Required]
  [MinLength(10)]
  [MaxLength(1000)]
  public required string ReviewText { get; set; }

  public new DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public new DateTime? UpdatedAt { get; set; }

  // Navigation properties
  public virtual Doctor? Doctor { get; set; }
  public virtual Patient? Patient { get; set; }

  // Helper method to update review
  public void UpdateReview(decimal starRating, string reviewText)
  {
    StarRating = starRating;
    ReviewText = reviewText;
    UpdatedAt = DateTime.UtcNow;
  }
}
