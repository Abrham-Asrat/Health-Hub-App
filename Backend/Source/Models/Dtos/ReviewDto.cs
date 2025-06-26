using System.ComponentModel.DataAnnotations;
using HealthHub.Source.Attributes;
using HealthHub.Source.Models.Interfaces;

namespace HealthHub.Source.Models.Dtos;

/// <summary>
/// Profile DTO for review participants (Doctor or Patient)
/// </summary>
public class ReviewProfileDto : IProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ProfilePicture { get; set; } = string.Empty;
}

/// <summary>
/// Complete review DTO with all details including doctor and patient profiles
/// </summary>
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
  public required bool IsEdited { get; set; }
};

/// <summary>
/// Simplified review DTO for listing purposes
/// </summary>
public record ReviewSummaryDto
{
  public required Guid ReviewId { get; set; }
  public required decimal StarRating { get; set; }
  public required string ReviewText { get; set; }
  public required DateTime CreatedAt { get; set; }
  public required DateTime? UpdatedAt { get; set; }
  public required string PatientName { get; set; }
  public required string PatientProfilePicture { get; set; }
  public required bool IsEdited { get; set; }
};

/// <summary>
/// DTO for creating a new review
/// </summary>
public record CreateReviewDto
{
  /// <summary>
  /// ID of the doctor being reviewed
  /// </summary>
  [Required(ErrorMessage = "Doctor ID is required")]
  public required Guid DoctorId { get; set; }

  /// <summary>
  /// ID of the patient posting the review
  /// </summary>
  [Required(ErrorMessage = "Patient ID is required")]
  public required Guid PatientId { get; set; }

  /// <summary>
  /// Star rating (0-5 stars)
  /// </summary>
  [Required(ErrorMessage = "Star rating is required")]
  [StarRating]
  [Range(0, 5, ErrorMessage = "Star rating must be between 0 and 5")]
  public required decimal StarRating { get; set; }

  /// <summary>
  /// Review text content
  /// </summary>
  [Required(ErrorMessage = "Review text is required")]
  [MinLength(10, ErrorMessage = "Review text must be at least 10 characters long")]
  [MaxLength(1000, ErrorMessage = "Review text cannot exceed 1000 characters")]
  public required string ReviewText { get; set; }
};

/// <summary>
/// DTO for editing an existing review
/// </summary>
public record EditReviewDto
{
  /// <summary>
  /// ID of the review to edit
  /// </summary>
  [Required(ErrorMessage = "Review ID is required")]
  public required Guid ReviewId { get; set; }

  /// <summary>
  /// Updated star rating (0-5 stars)
  /// </summary>
  [Required(ErrorMessage = "Star rating is required")]
  [StarRating]
  [Range(0, 5, ErrorMessage = "Star rating must be between 0 and 5")]
  public required decimal StarRating { get; set; }

  /// <summary>
  /// Updated review text content
  /// </summary>
  [Required(ErrorMessage = "Review text is required")]
  [MinLength(10, ErrorMessage = "Review text must be at least 10 characters long")]
  [MaxLength(1000, ErrorMessage = "Review text cannot exceed 1000 characters")]
  public required string ReviewText { get; set; }
};

/// <summary>
/// DTO for doctor review statistics
/// </summary>
public record DoctorReviewStatsDto
{
  public required Guid DoctorId { get; set; }
  public required string DoctorName { get; set; }
  public required decimal AverageRating { get; set; }
  public required int TotalReviews { get; set; }
  public required int FiveStarReviews { get; set; }
  public required int FourStarReviews { get; set; }
  public required int ThreeStarReviews { get; set; }
  public required int TwoStarReviews { get; set; }
  public required int OneStarReviews { get; set; }
  public required int ZeroStarReviews { get; set; }
  public required ICollection<ReviewSummaryDto> RecentReviews { get; set; } = new List<ReviewSummaryDto>();
};

/// <summary>
/// DTO for patient review history
/// </summary>
public record PatientReviewHistoryDto
{
  public required Guid PatientId { get; set; }
  public required string PatientName { get; set; }
  public required int TotalReviewsPosted { get; set; }
  public required decimal AverageRatingGiven { get; set; }
  public required ICollection<ReviewSummaryDto> Reviews { get; set; } = new List<ReviewSummaryDto>();
};

/// <summary>
/// DTO for review search/filter criteria
/// </summary>
public record ReviewSearchDto
{
  public Guid? DoctorId { get; set; }
  public Guid? PatientId { get; set; }
  public decimal? MinRating { get; set; }
  public decimal? MaxRating { get; set; }
  public DateTime? FromDate { get; set; }
  public DateTime? ToDate { get; set; }
  public bool? IsEdited { get; set; }
  public int Page { get; set; } = 1;
  public int PageSize { get; set; } = 10;
  public string? SortBy { get; set; } = "CreatedAt";
  public bool SortDescending { get; set; } = true;
};
