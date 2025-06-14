using HealthHub.Source.Services.ReviewService;
using Microsoft.AspNetCore.Mvc;
using HealthHub.Source.Models.Responses;
using HealthHub.Source.Models.Dtos;

[ApiController]
[Route("api/reviews")]
public class ReviewController(IReviewService reviewService, ILogger<ReviewController> logger)
  : ControllerBase
{
  [HttpPost]
  public async Task<IActionResult> PostReview(CreateReviewDto createReviewDto)
  {
    try
    {
      var review = await reviewService.CreateReviewAsync(createReviewDto);
      return Ok(new ApiResponse<ReviewDto>(true, "Review created successfully", review));
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to create review");
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "An error occurred while creating the review", null));
    }
  }

  /// <summary>
  /// Get all reviews
  /// </summary>
  /// <returns>List of reviews</returns>
  [HttpGet]
  public async Task<IActionResult> GetAllReviews()
  {
    try
    {
      var reviews = await reviewService.GetAllReviews();
      return Ok(new ApiResponse<ICollection<ReviewDto>>(true, "Reviews retrieved successfully", reviews));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get all reviews");
      return StatusCode(500, new ApiResponse<ICollection<ReviewDto>>(false, "An error occurred while retrieving reviews", null));
    }
  }

  /// <summary>
  /// Get review by ID
  /// </summary>
  /// <param name="reviewId">The ID of the review to retrieve</param>
  /// <returns>The review with the specified ID</returns>
  [HttpGet("{reviewId}")]
  public async Task<IActionResult> GetReviewById(Guid reviewId)
  {
    try
    {
      var review = await reviewService.GetReviewAsync(reviewId);
      return Ok(new ApiResponse<ReviewDto>(true, "Review retrieved successfully", review));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get review by ID: {ReviewId}", reviewId);
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "An error occurred while retrieving the review", null));
    }
  }

  [HttpGet("doctor/{doctorId}")]
  public async Task<IActionResult> GetDoctorReviews(Guid doctorId)
  {
    try
    {
      var reviews = await reviewService.GetAllReviewsForDoctorAsync(doctorId);
      return Ok(new ApiResponse<ICollection<ReviewDto>>(true, "Doctor reviews retrieved successfully", reviews));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ICollection<ReviewDto>>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get doctor reviews: {DoctorId}", doctorId);
      return StatusCode(500, new ApiResponse<ICollection<ReviewDto>>(false, "An error occurred while retrieving doctor reviews", null));
    }
  }

  [HttpGet("patient/{patientId}")]
  public async Task<IActionResult> GetPatientReviews(Guid patientId)
  {
    try
    {
      var reviews = await reviewService.GetAllReviewsForPatientAsync(patientId);
      return Ok(new ApiResponse<ICollection<ReviewDto>>(true, "Patient reviews retrieved successfully", reviews));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ICollection<ReviewDto>>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get patient reviews: {PatientId}", patientId);
      return StatusCode(500, new ApiResponse<ICollection<ReviewDto>>(false, "An error occurred while retrieving patient reviews", null));
    }
  }
}
