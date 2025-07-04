using HealthHub.Source.Models.Dtos;
using HealthHub.Source.Models.Entities;

namespace HealthHub.Source.Services.BlogService;

public interface IBlogService
{
  Task<BlogDto> CreateBlogAsync(CreateBlogDto createBlogDto);

  Task<List<BlogDto>> GetAllBlogsAsync();

  Task<BlogDto> GetBlogAsync(Guid blogId);

  Task<BlogDto> UpdateBlogAsync(Guid blogId, EditBlogDto editBlogDto);

  Task<Blog> GetBlogIfExists(Guid blogId);

  void DeleteAllBlogs();

  Task<ICollection<Tag>> CreateTagsAsync(IList<string> tags);

  Task<ICollection<BlogTag>> CreateBlogTagAssocAsync(Guid blogId, ICollection<Tag> tags);

  Task<BlogCommentDto> CreateBlogCommentAsync(CreateBlogCommentDto createBlogCommentDto);

  Task<ICollection<BlogCommentDto>> GetBlogCommentsAsync(Guid blogId);

  Task<BlogLikeDto?> CreateBlogLikeAsync(CreateBlogLikeDto createBlogLikeDto);
}
