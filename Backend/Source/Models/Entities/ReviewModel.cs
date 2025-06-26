using System.ComponentModel.DataAnnotations;
using HealthHub.Source.Attributes;

namespace HealthHub.Source.Models.Entities;

/// <summary>
/// Review entity representing a patient's review of a doctor
/// Patient is the review poster, Doctor is the review viewer
/// </summary>
public class Review : BaseEntity
{
  /// <summary>
  /// Unique identifier for the review
  /// </summary>
  public Guid ReviewId { get; set; } = Guid.NewGuid();

  /// <summary>
  /// Foreign key to the Doctor being reviewed (viewer)
  /// </summary>
  [Required]
  public Guid DoctorId { get; set; }

  /// <summary>
  /// Foreign key to the Patient posting the review (poster)
  /// </summary>
  [Required]
  public Guid PatientId { get; set; }

  /// <summary>
  /// Star rating given by the patient (0-5 stars)
  /// </summary>
  [Required]
  [StarRating]
  [Range(0, 5)]
  public decimal StarRating { get; set; }

  /// <summary>
  /// Text content of the review
  /// </summary>
  [Required]
  [MinLength(10, ErrorMessage = "Review text must be at least 10 characters long")]
  [MaxLength(1000, ErrorMessage = "Review text cannot exceed 1000 characters")]
  public required string ReviewText { get; set; }

  /// <summary>
  /// When the review was created
  /// </summary>
  public new DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  /// <summary>
  /// When the review was last updated (null if never updated)
  /// </summary>
  public new DateTime? UpdatedAt { get; set; }

  // Navigation properties
  /// <summary>
  /// Navigation property to the Doctor being reviewed
  /// </summary>
  public virtual Doctor? Doctor { get; set; }

  /// <summary>
  /// Navigation property to the Patient who posted the review
  /// </summary>
  public virtual Patient? Patient { get; set; }

  /// <summary>
  /// Updates the review with new rating and text
  /// </summary>
  /// <param name="starRating">New star rating</param>
  /// <param name="reviewText">New review text</param>
  public void UpdateReview(decimal starRating, string reviewText)
  {
    StarRating = starRating;
    ReviewText = reviewText;
    UpdatedAt = DateTime.UtcNow;
  }

  /// <summary>
  /// Gets the full name of the patient who posted the review
  /// </summary>
  /// <returns>Patient's full name or empty string if not available</returns>
  public string GetPatientFullName()
  {
    return Patient?.User != null 
      ? $"{Patient.User.FirstName} {Patient.User.LastName}".Trim()
      : string.Empty;
  }

  /// <summary>
  /// Gets the full name of the doctor being reviewed
  /// </summary>
  /// <returns>Doctor's full name or empty string if not available</returns>
  public string GetDoctorFullName()
  {
    return Doctor?.User != null 
      ? $"{Doctor.User.FirstName} {Doctor.User.LastName}".Trim()
      : string.Empty;
  }

  /// <summary>
  /// Checks if the review has been updated since creation
  /// </summary>
  /// <returns>True if the review has been updated, false otherwise</returns>
  public bool HasBeenUpdated()
  {
    return UpdatedAt.HasValue && UpdatedAt.Value > CreatedAt;
  }
}
