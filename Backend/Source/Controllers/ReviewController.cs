using HealthHub.Source.Services.ReviewService;
using Microsoft.AspNetCore.Mvc;
using HealthHub.Source.Models.Responses;
using HealthHub.Source.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using HealthHub.Source.Helpers.Extensions;
using HealthHub.Source.Helpers.Defaults;

[ApiController]
[Route("api/reviews")]
public class ReviewController(IReviewService reviewService, ILogger<ReviewController> logger)
  : ControllerBase
{
  /// <summary>
  /// Create a new review (only patients can post reviews)
  /// </summary>
  /// <param name="createReviewDto">Review data</param>
  /// <returns>The created review</returns>
  [HttpPost]
  [Authorize]
  public async Task<IActionResult> PostReview([FromBody] CreateReviewDto createReviewDto)
  {
    if (createReviewDto == null)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, "Review data is required", null));
    }
    
    if (!ModelState.IsValid)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, "Invalid review data", null));
    }
    
    try 
    {
      // Get the current authenticated user's ID from cookies
      var currentUserId = HttpContext.Request.Cookies[CookieDefaults.Profile.UserId];
      if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userId))
      {
        return Unauthorized(new ApiResponse<ReviewDto>(false, "User not authenticated", null));
      }
      
      // Ensure the current user is the patient posting the review
      if (userId != createReviewDto.PatientId)
      {
        return Forbid("You can only post reviews as yourself");
      }
      
      var review = await reviewService.CreateReviewAsync(createReviewDto);
      return CreatedAtAction(nameof(GetReviewById), new { reviewId = review.ReviewId },
        new ApiResponse<ReviewDto>(true, "Review Created Successfully", review)); 
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

  /// <summary>
  /// Get all reviews for a specific doctor (doctor as viewer)
  /// </summary>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <returns>List of reviews for the doctor</returns>
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

  /// <summary>
  /// Get all reviews posted by a specific patient (patient as poster)
  /// </summary>
  /// <param name="patientId">The ID of the patient</param>
  /// <returns>List of reviews posted by the patient</returns>
  [HttpGet("patient/{patientId}")]
  [Authorize]
  public async Task<IActionResult> GetPatientReviews(Guid patientId)
  {
    try
    {
      // Get the current authenticated user's ID from cookies
      var currentUserId = HttpContext.Request.Cookies[CookieDefaults.Profile.UserId];
      if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userId))
      {
        return Unauthorized(new ApiResponse<ICollection<ReviewDto>>(false, "User not authenticated", null));
      }
      
      // Ensure the current user can only view their own reviews
      if (userId != patientId)
      {
        return Forbid("You can only view your own reviews");
      }
      
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

  /// <summary>
  /// Edit a review (only the patient who posted it can edit)
  /// </summary>
  /// <param name="editReviewDto">Updated review data</param>
  /// <returns>The updated review</returns>
  [HttpPut]
  [Authorize]
  public async Task<IActionResult> EditReview([FromBody] EditReviewDto editReviewDto)
  {
    if (editReviewDto == null)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, "Review data is required", null));
    }
    
    if (!ModelState.IsValid)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, "Invalid review data", null));
    }
    
    try
    {
      // Get the current authenticated user's ID from cookies
      var currentUserId = HttpContext.Request.Cookies[CookieDefaults.Profile.UserId];
      if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userId))
      {
        return Unauthorized(new ApiResponse<ReviewDto>(false, "User not authenticated", null));
      }
      
      // Get the review to check if the current user is the author
      var existingReview = await reviewService.GetReviewAsync(editReviewDto.ReviewId);
      if (existingReview.PatientId != userId)
      {
        return Forbid("You can only edit your own reviews");
      }
      
      var review = await reviewService.EditReviewAsync(editReviewDto);
      return Ok(new ApiResponse<ReviewDto>(true, "Review updated successfully", review));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to edit review");
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "An error occurred while updating the review", null));
    }
  }

  /// <summary>
  /// Delete a review (only the patient who posted it can delete)
  /// </summary>
  /// <param name="reviewId">The ID of the review to delete</param>
  /// <returns>No content on success</returns>
  [HttpDelete("{reviewId}")]
  [Authorize]
  public async Task<IActionResult> DeleteReview(Guid reviewId)
  {
    try
    {
      // Get the current authenticated user's ID from cookies
      var currentUserId = HttpContext.Request.Cookies[CookieDefaults.Profile.UserId];
      if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userId))
      {
        return Unauthorized(new ApiResponse<object>(false, "User not authenticated", null));
      }
      
      // Get the review to check if the current user is the author
      var existingReview = await reviewService.GetReviewAsync(reviewId);
      if (existingReview.PatientId != userId)
      {
        return Forbid("You can only delete your own reviews");
      }
      
      await reviewService.DeleteReviewAsync(reviewId);
      return NoContent();
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<object>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to delete review: {ReviewId}", reviewId);
      return StatusCode(500, new ApiResponse<object>(false, "An error occurred while deleting the review", null));
    }
  }

  /// <summary>
  /// Get review statistics for a doctor
  /// </summary>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <returns>Doctor review statistics</returns>
  [HttpGet("doctor/{doctorId}/stats")]
  public async Task<IActionResult> GetDoctorReviewStats(Guid doctorId)
  {
    try
    {
      var stats = await reviewService.GetDoctorReviewStatsAsync(doctorId);
      return Ok(new ApiResponse<DoctorReviewStatsDto>(true, "Doctor review statistics retrieved successfully", stats));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<DoctorReviewStatsDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get doctor review stats: {DoctorId}", doctorId);
      return StatusCode(500, new ApiResponse<DoctorReviewStatsDto>(false, "An error occurred while retrieving doctor review statistics", null));
    }
  }

  /// <summary>
  /// Get review history for a patient
  /// </summary>
  /// <param name="patientId">The ID of the patient</param>
  /// <returns>Patient review history</returns>
  [HttpGet("patient/{patientId}/history")]
  [Authorize]
  public async Task<IActionResult> GetPatientReviewHistory(Guid patientId)
  {
    try
    {
      // Get the current authenticated user's ID from cookies
      var currentUserId = HttpContext.Request.Cookies[CookieDefaults.Profile.UserId];
      if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userId))
      {
        return Unauthorized(new ApiResponse<PatientReviewHistoryDto>(false, "User not authenticated", null));
      }
      
      // Ensure the current user can only view their own review history
      if (userId != patientId)
      {
        return Forbid("You can only view your own review history");
      }
      
      var history = await reviewService.GetPatientReviewHistoryAsync(patientId);
      return Ok(new ApiResponse<PatientReviewHistoryDto>(true, "Patient review history retrieved successfully", history));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<PatientReviewHistoryDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get patient review history: {PatientId}", patientId);
      return StatusCode(500, new ApiResponse<PatientReviewHistoryDto>(false, "An error occurred while retrieving patient review history", null));
    }
  }

  /// <summary>
  /// Search and filter reviews
  /// </summary>
  /// <param name="searchDto">Search criteria</param>
  /// <returns>Filtered collection of reviews</returns>
  [HttpGet("search")]
  public async Task<IActionResult> SearchReviews([FromQuery] ReviewSearchDto searchDto)
  {
    try
    {
      var reviews = await reviewService.SearchReviewsAsync(searchDto);
      return Ok(new ApiResponse<ICollection<ReviewSummaryDto>>(true, "Reviews search completed successfully", reviews));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to search reviews");
      return StatusCode(500, new ApiResponse<ICollection<ReviewSummaryDto>>(false, "An error occurred while searching reviews", null));
    }
  }

  /// <summary>
  /// Get recent reviews for a doctor
  /// </summary>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <param name="count">Number of recent reviews to return (default: 5)</param>
  /// <returns>Collection of recent reviews</returns>
  [HttpGet("doctor/{doctorId}/recent")]
  public async Task<IActionResult> GetRecentReviewsForDoctor(Guid doctorId, [FromQuery] int count = 5)
  {
    try
    {
      if (count <= 0 || count > 20)
      {
        return BadRequest(new ApiResponse<ICollection<ReviewSummaryDto>>(false, "Count must be between 1 and 20", null));
      }
      
      var reviews = await reviewService.GetRecentReviewsForDoctorAsync(doctorId, count);
      return Ok(new ApiResponse<ICollection<ReviewSummaryDto>>(true, "Recent reviews retrieved successfully", reviews));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ICollection<ReviewSummaryDto>>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get recent reviews for doctor: {DoctorId}", doctorId);
      return StatusCode(500, new ApiResponse<ICollection<ReviewSummaryDto>>(false, "An error occurred while retrieving recent reviews", null));
    }
  }

  /// <summary>
  /// Check if a patient has already reviewed a doctor
  /// </summary>
  /// <param name="patientId">The ID of the patient</param>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <returns>True if review exists, false otherwise</returns>
  [HttpGet("check/{patientId}/{doctorId}")]
  [Authorize]
  public async Task<IActionResult> CheckIfPatientReviewedDoctor(Guid patientId, Guid doctorId)
  {
    try
    {
      // Get the current authenticated user's ID from cookies
      var currentUserId = HttpContext.Request.Cookies[CookieDefaults.Profile.UserId];
      if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userId))
      {
        return Unauthorized(new ApiResponse<bool>(false, "User not authenticated", false));
      }
      
      // Ensure the current user can only check their own review status
      if (userId != patientId)
      {
        return Forbid("You can only check your own review status");
      }
      
      var hasReviewed = await reviewService.HasPatientReviewedDoctorAsync(patientId, doctorId);
      return Ok(new ApiResponse<bool>(true, "Review status checked successfully", hasReviewed));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to check if patient reviewed doctor: {PatientId}, {DoctorId}", patientId, doctorId);
      return StatusCode(500, new ApiResponse<bool>(false, "An error occurred while checking review status", false));
    }
  }

  /// <summary>
  /// Get the average rating for a doctor
  /// </summary>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <returns>Average rating (0 if no reviews)</returns>
  [HttpGet("doctor/{doctorId}/average-rating")]
  public async Task<IActionResult> GetDoctorAverageRating(Guid doctorId)
  {
    try
    {
      var averageRating = await reviewService.GetDoctorAverageRatingAsync(doctorId);
      return Ok(new ApiResponse<decimal>(true, "Doctor average rating retrieved successfully", averageRating));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<decimal>(false, ex.Message, 0));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get doctor average rating: {DoctorId}", doctorId);
      return StatusCode(500, new ApiResponse<decimal>(false, "An error occurred while retrieving doctor average rating", 0));
    }
  }
}
