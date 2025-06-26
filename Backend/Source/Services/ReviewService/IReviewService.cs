using HealthHub.Source.Models.Dtos;

namespace HealthHub.Source.Services.ReviewService;

public interface IReviewService
{
  /// <summary>
  /// Creates a new review
  /// </summary>
  /// <param name="createReviewDto">Review data</param>
  /// <returns>The created review</returns>
  Task<ReviewDto> CreateReviewAsync(CreateReviewDto createReviewDto);

  /// <summary>
  /// Gets a review by its ID
  /// </summary>
  /// <param name="reviewId">Review ID</param>
  /// <returns>The review</returns>
  Task<ReviewDto> GetReviewAsync(Guid reviewId);

  /// <summary>
  /// Gets all reviews
  /// </summary>
  /// <returns>Collection of all reviews</returns>
  Task<ICollection<ReviewDto>> GetAllReviews();

  /// <summary>
  /// Gets all reviews for a specific doctor
  /// </summary>
  /// <param name="doctorId">Doctor ID</param>
  /// <returns>Collection of reviews for the doctor</returns>
  Task<ICollection<ReviewDto>> GetAllReviewsForDoctorAsync(Guid doctorId);

  /// <summary>
  /// Gets all reviews posted by a specific patient
  /// </summary>
  /// <param name="patientId">Patient ID</param>
  /// <returns>Collection of reviews posted by the patient</returns>
  Task<ICollection<ReviewDto>> GetAllReviewsForPatientAsync(Guid patientId);

  /// <summary>
  /// Edits an existing review
  /// </summary>
  /// <param name="editReviewDto">Updated review data</param>
  /// <returns>The updated review</returns>
  Task<ReviewDto> EditReviewAsync(EditReviewDto editReviewDto);

  /// <summary>
  /// Deletes a review
  /// </summary>
  /// <param name="reviewId">Review ID</param>
  Task DeleteReviewAsync(Guid reviewId);

  /// <summary>
  /// Gets review statistics for a doctor
  /// </summary>
  /// <param name="doctorId">Doctor ID</param>
  /// <returns>Doctor review statistics</returns>
  Task<DoctorReviewStatsDto> GetDoctorReviewStatsAsync(Guid doctorId);

  /// <summary>
  /// Gets review history for a patient
  /// </summary>
  /// <param name="patientId">Patient ID</param>
  /// <returns>Patient review history</returns>
  Task<PatientReviewHistoryDto> GetPatientReviewHistoryAsync(Guid patientId);

  /// <summary>
  /// Searches and filters reviews based on criteria
  /// </summary>
  /// <param name="searchDto">Search criteria</param>
  /// <returns>Filtered collection of reviews</returns>
  Task<ICollection<ReviewSummaryDto>> SearchReviewsAsync(ReviewSearchDto searchDto);

  /// <summary>
  /// Gets recent reviews for a doctor (limited count)
  /// </summary>
  /// <param name="doctorId">Doctor ID</param>
  /// <param name="count">Number of recent reviews to return</param>
  /// <returns>Collection of recent reviews</returns>
  Task<ICollection<ReviewSummaryDto>> GetRecentReviewsForDoctorAsync(Guid doctorId, int count = 5);

  /// <summary>
  /// Checks if a patient has already reviewed a doctor
  /// </summary>
  /// <param name="patientId">Patient ID</param>
  /// <param name="doctorId">Doctor ID</param>
  /// <returns>True if review exists, false otherwise</returns>
  Task<bool> HasPatientReviewedDoctorAsync(Guid patientId, Guid doctorId);

  /// <summary>
  /// Gets the average rating for a doctor
  /// </summary>
  /// <param name="doctorId">Doctor ID</param>
  /// <returns>Average rating (0 if no reviews)</returns>
  Task<decimal> GetDoctorAverageRatingAsync(Guid doctorId);
}
