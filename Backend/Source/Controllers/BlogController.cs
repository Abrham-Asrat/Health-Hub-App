using System.ComponentModel.DataAnnotations;
using HealthHub.Source.Helpers.Defaults;
using HealthHub.Source.Helpers.Extensions;
using HealthHub.Source.Models.Dtos;
using HealthHub.Source.Models.Responses;
using HealthHub.Source.Services.BlogService;
using HealthHub.Source.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/blogs")]
public class BlogController : ControllerBase
{
  private readonly IBlogService _blogService;
  private readonly AuthService _authService;
  private readonly ILogger<BlogController> _logger;

  public BlogController(
    IBlogService blogService,
    AuthService authService,
    ILogger<BlogController> logger)
  {
    _blogService = blogService;
    _authService = authService;
    _logger = logger;
  }

  /// <summary>
  /// Get all blogs
  /// </summary>
  /// <returns></returns>
  [HttpGet("all")]
  public async Task<IActionResult> GetAllBlogs()
  {
    try
    {
      var result = await _blogService.GetAllBlogsAsync();
      return Ok(new ApiResponse<List<BlogDto>>(true, "Blogs retrieved successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to get all the blogs.");
      throw;
    }
  }

  /// <summary>
  /// Get blog by id
  /// </summary>
  /// <param name="blogId"></param>
  /// <returns></returns>
  [HttpGet("{blogId}")]
  public async Task<IActionResult> GetBlogById([FromRoute] [Required] [Guid] Guid blogId)
  {
    try
    {
      var result = await _blogService.GetBlogAsync(blogId);
      return Ok(new ApiResponse<BlogDto>(true, "Blog retrieved successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to get blog by id.");
      throw;
    }
  }

  /// <summary>
  /// Create a new blog
  /// </summary>
  /// <param name="createBlogDto"></param>
  /// <returns></returns>
  [HttpPost]
  public async Task<IActionResult> CreateBlog([FromBody] CreateBlogDto createBlogDto)
  {
    try
    {
      var result = await _blogService.CreateBlogAsync(createBlogDto);
      return Ok(new ApiResponse<BlogDto>(true, "Blog created successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to create blog");
      throw;
    }
  }

  /// <summary>
  /// Update a blog
  /// </summary>
  /// <param name="blogId"></param>
  /// <param name="editBlogDto"></param>
  /// <returns></returns>
  [HttpPut("{blogId}")]
  public async Task<IActionResult> UpdateBlog(
    [FromRoute] Guid blogId,
    [FromBody] EditBlogDto editBlogDto
  )
  {
    try
    {
      var result = await _blogService.UpdateBlogAsync(blogId, editBlogDto);
      return Ok(new ApiResponse<BlogDto>(true, "Blog updated successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to update blog");
      throw;
    }
  }

  /// <summary>
  /// Delete all blogs (Only for Testing Purpose)
  /// </summary>
  /// <returns></returns>
  [HttpDelete("all")]
  public IActionResult DeleteAllBlogs()
  {
    try
    {
      _blogService.DeleteAllBlogs();
      return NoContent();
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to update blog");
      throw;
    }
  }

  [HttpPost("comment")]
  public async Task<IActionResult> PostCommentOnBlog(
    [FromBody] CreateBlogCommentDto createBlogCommentDto
  )
  {
    try
    {
      var result = await _blogService.CreateBlogCommentAsync(createBlogCommentDto);
      return Ok(new ApiResponse<BlogCommentDto>(true, "Comment posted successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to post a  blog comment");
      throw;
    }
  }

  [HttpGet("{blogId}/comments")]
  public async Task<IActionResult> GetBlogComments([FromRoute] [Required] [Guid] Guid blogId)
  {
    try
    {
      var result = await _blogService.GetBlogCommentsAsync(blogId);
      return Ok(
        new ApiResponse<ICollection<BlogCommentDto>>(
          true,
          "Blog comments retrieved successfully",
          result
        )
      );
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to get blog comments.");
      throw;
    }
  }

  [HttpPost("{id}/like")]
  public async Task<IActionResult> LikeBlog(Guid id)
  {
    try
    {
      var userId = User.GetUserId();
      var createBlogLikeDto = new CreateBlogLikeDto(userId, id);
      var result = await _blogService.CreateBlogLikeAsync(createBlogLikeDto);
      return Ok(new ApiResponse<BlogLikeDto?>(true, result == null ? "Unliked" : "Liked", result));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error liking blog post");
      return StatusCode(500, "An error occurred while liking the blog post");
    }
  }
}
