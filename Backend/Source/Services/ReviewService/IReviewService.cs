using HealthHub.Source.Models.Dtos;

namespace HealthHub.Source.Services.ReviewService;

public interface IReviewService
{
  Task<ReviewDto> CreateReviewAsync(CreateReviewDto createReviewDto);

  Task<ReviewDto> GetReviewAsync(Guid reviewId);

  Task<ICollection<ReviewDto>> GetAllReviews();

  Task<ICollection<ReviewDto>> GetAllReviewsForDoctorAsync(Guid doctorId);

  Task<ICollection<ReviewDto>> GetAllReviewsForPatientAsync(Guid patientId);

  Task<ReviewDto> EditReviewAsync(EditReviewDto editReviewDto);

  Task DeleteReviewAsync(Guid reviewId);
}
