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

  public async Task<DoctorReviewStatsDto> GetDoctorReviewStatsAsync(Guid doctorId)
  {
    try
    {
      var doctor = await appContext.Doctors
        .Include(d => d.User)
        .FirstOrDefaultAsync(d => d.DoctorId == doctorId);

      if (doctor == default)
        throw new KeyNotFoundException("Doctor with the given id is not found.");

      var reviews = await appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .Where(r => r.DoctorId == doctorId)
        .ToListAsync();

      return reviews.ToDoctorReviewStatsDto(doctor, doctor.User);
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to get doctor review stats.");
      throw;
    }
  }

  public async Task<PatientReviewHistoryDto> GetPatientReviewHistoryAsync(Guid patientId)
  {
    try
    {
      var patient = await appContext.Patients
        .Include(p => p.User)
        .FirstOrDefaultAsync(p => p.PatientId == patientId);

      if (patient == default)
        throw new KeyNotFoundException("Patient with the given id is not found.");

      var reviews = await appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .Where(r => r.PatientId == patientId)
        .ToListAsync();

      return reviews.ToPatientReviewHistoryDto(patient, patient.User);
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to get patient review history.");
      throw;
    }
  }

  public async Task<ICollection<ReviewSummaryDto>> SearchReviewsAsync(ReviewSearchDto searchDto)
  {
    try
    {
      var query = appContext.Reviews
        .Include(r => r.Doctor)
        .ThenInclude(d => d.User)
        .Include(r => r.Patient)
        .ThenInclude(p => p.User)
        .AsQueryable();

      // Apply filters
      if (searchDto.DoctorId.HasValue)
        query = query.Where(r => r.DoctorId == searchDto.DoctorId.Value);

      if (searchDto.PatientId.HasValue)
        query = query.Where(r => r.PatientId == searchDto.PatientId.Value);

      if (searchDto.MinRating.HasValue)
        query = query.Where(r => r.StarRating >= searchDto.MinRating.Value);

      if (searchDto.MaxRating.HasValue)
        query = query.Where(r => r.StarRating <= searchDto.MaxRating.Value);

      if (searchDto.FromDate.HasValue)
        query = query.Where(r => r.CreatedAt >= searchDto.FromDate.Value);

      if (searchDto.ToDate.HasValue)
        query = query.Where(r => r.CreatedAt <= searchDto.ToDate.Value);

      if (searchDto.IsEdited.HasValue)
      {
        if (searchDto.IsEdited.Value)
          query = query.Where(r => r.UpdatedAt.HasValue && r.UpdatedAt > r.CreatedAt);
        else
          query = query.Where(r => !r.UpdatedAt.HasValue || r.UpdatedAt <= r.CreatedAt);
      }

      // Apply sorting
      query = searchDto.SortBy?.ToLower() switch
      {
        "rating" => searchDto.SortDescending ? query.OrderByDescending(r => r.StarRating) : query.OrderBy(r => r.StarRating),
        "patientname" => searchDto.SortDescending ? query.OrderByDescending(r => r.Patient.User.LastName) : query.OrderBy(r => r.Patient.User.LastName),
        "doctorname" => searchDto.SortDescending ? query.OrderByDescending(r => r.Doctor.User.LastName) : query.OrderBy(r => r.Doctor.User.LastName),
        _ => searchDto.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt)
      };

      // Apply pagination
      var skip = (searchDto.Page - 1) * searchDto.PageSize;
      query = query.Skip(skip).Take(searchDto.PageSize);

      var reviews = await query.ToListAsync();
      return reviews.Select(r => r.ToReviewSummaryDto()).ToList();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to search reviews.");
      throw;
    }
  }

  public async Task<ICollection<ReviewSummaryDto>> GetRecentReviewsForDoctorAsync(Guid doctorId, int count = 5)
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
        .Take(count)
        .ToListAsync();

      return reviews.Select(r => r.ToReviewSummaryDto()).ToList();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to get recent reviews for doctor.");
      throw;
    }
  }

  public async Task<bool> HasPatientReviewedDoctorAsync(Guid patientId, Guid doctorId)
  {
    try
    {
      var review = await appContext.Reviews
        .FirstOrDefaultAsync(r => r.PatientId == patientId && r.DoctorId == doctorId);

      return review != null;
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to check if patient has reviewed doctor.");
      throw;
    }
  }

  public async Task<decimal> GetDoctorAverageRatingAsync(Guid doctorId)
  {
    try
    {
      var doctor = await appContext.Doctors.FirstOrDefaultAsync(d => d.DoctorId == doctorId);

      if (doctor == default)
        throw new KeyNotFoundException("Doctor with the given id is not found.");

      var averageRating = await appContext.Reviews
        .Where(r => r.DoctorId == doctorId)
        .AverageAsync(r => r.StarRating);

      return Math.Round(averageRating, 1);
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to get doctor average rating.");
      throw;
    }
  }
}
