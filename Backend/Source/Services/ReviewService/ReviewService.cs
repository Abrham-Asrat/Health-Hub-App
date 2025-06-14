using HealthHub.Source.Data;
using HealthHub.Source.Helpers.Extensions;
using HealthHub.Source.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HealthHub.Source.Services.ReviewService;

public class ReviewService(
  AppointmentService appointmentService,
  ApplicationContext appContext,
  ILogger<ReviewService> logger
) : IReviewService
{
  public async Task<ReviewDto> CreateReviewAsync(CreateReviewDto createReviewDto)
  {
    try
    {
      // Check if patient has completed an appointment with the doctor
      var hasCompletedAppointment = await appointmentService.HasCompletedAppointmentAsync(
        createReviewDto.PatientId,
        createReviewDto.DoctorId
      );

      if (!hasCompletedAppointment)
        throw new InvalidOperationException("Cannot review a doctor without completing an appointment.");

      // Check if patient has already reviewed this doctor
      var existingReview = await appContext.Reviews
        .FirstOrDefaultAsync(r => 
          r.DoctorId == createReviewDto.DoctorId && 
          r.PatientId == createReviewDto.PatientId);

      if (existingReview != null)
        throw new InvalidOperationException("You have already reviewed this doctor.");

      var review = await appContext.Reviews.AddAsync(createReviewDto.ToReview());
      await appContext.SaveChangesAsync();

      // Include doctor and patient profiles in the response
      var reviewWithProfiles = await appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .FirstOrDefaultAsync(r => r.ReviewId == review.Entity.ReviewId);

      return reviewWithProfiles?.ToReviewDto() ?? 
        throw new InvalidOperationException("Failed to create review.");
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to create review.");
      throw;
    }
  }

  public async Task DeleteReviewAsync(Guid reviewId)
  {
    try
    {
      var review = await appContext.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId);

      if (review == default)
        throw new KeyNotFoundException("Review with the given id not found. Cannot delete.");

      appContext.Reviews.Remove(review);
      await appContext.SaveChangesAsync();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to delete review.");
      throw;
    }
  }

  public async Task<ReviewDto> EditReviewAsync(EditReviewDto editReviewDto)
  {
    try
    {
      var review = await appContext.Reviews.FirstOrDefaultAsync(r =>
        r.ReviewId == editReviewDto.ReviewId
      );

      if (review == default)
        throw new KeyNotFoundException("Review with the given id not found. Cannot edit.");

      review.UpdateReview(editReviewDto.StarRating, editReviewDto.ReviewText);
      await appContext.SaveChangesAsync();

      // Include doctor and patient profiles in the response
      var updatedReview = await appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .FirstOrDefaultAsync(r => r.ReviewId == review.ReviewId);

      return updatedReview?.ToReviewDto() ?? 
        throw new InvalidOperationException("Failed to update review.");
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to edit review.");
      throw;
    }
  }

  public async Task<ICollection<ReviewDto>> GetAllReviewsForDoctorAsync(Guid doctorId)
  {
    try
    {
      var doctor = await appContext.Doctors.FirstOrDefaultAsync(d => d.DoctorId == doctorId);

      if (doctor == default)
        throw new KeyNotFoundException("Doctor with the given id is not found.");

      var reviews = await appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .Where(r => r.DoctorId == doctorId)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();

      return reviews.Select(r => r.ToReviewDto()).ToList();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to get doctor reviews.");
      throw;
    }
  }

  public async Task<ICollection<ReviewDto>> GetAllReviewsForPatientAsync(Guid patientId)
  {
    try
    {
      var patient = await appContext.Patients.FirstOrDefaultAsync(p => p.PatientId == patientId);

      if (patient == default)
        throw new KeyNotFoundException("Patient with the given id is not found.");

      var reviews = await appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .Where(r => r.PatientId == patientId)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();

      return reviews.Select(r => r.ToReviewDto()).ToList();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to get patient reviews.");
      throw;
    }
  }

  public async Task<ReviewDto> GetReviewAsync(Guid reviewId)
  {
    try
    {
      var review = await appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .FirstOrDefaultAsync(r => r.ReviewId == reviewId);

      if (review == default)
        throw new KeyNotFoundException("Review with the given id not found.");

      return review.ToReviewDto();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to get review.");
      throw;
    }
  }

  public async Task<ICollection<ReviewDto>> GetAllReviews()
  {
    try
    {
      var reviews = await appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();

      return reviews.Select(r => r.ToReviewDto()).ToList();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to get all reviews.");
      throw;
    }
  }
}
