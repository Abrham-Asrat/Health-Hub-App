using System.ComponentModel.DataAnnotations;

namespace HealthHub.Source.Models.Entities;

public class File : BaseEntity
{
  public Guid FileId { get; set; } = Guid.NewGuid();
  public required string? FileName { get; set; }
  public required string MimeType { get; set; }
  public string? FileUrl { get; set; }

  [MaxLength(5242880)] // MaxSize = 5mb file
  public required byte[] FileData { get; set; } = [];
  public int FileSize => FileData.Length; // Derived from FileData
}
