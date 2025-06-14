using System;

namespace HealthHub.Source.Models.Interfaces;

public interface IProfileDto
{
    Guid Id { get; set; }
    string FirstName { get; set; }
    string LastName { get; set; }
    string Email { get; set; }
    string? ProfilePicture { get; set; }
} 