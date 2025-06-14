using System.ComponentModel.DataAnnotations;

namespace HealthHub.Source.Models.Dtos;

/// <summary>
/// DTO for sending OTP request
/// </summary>
public class SendOtpDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
}

/// <summary>
/// DTO for verifying OTP request
/// </summary>
public class VerifyOtpDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [Range(100000, 999999, ErrorMessage = "OTP must be a 6-digit number")]
    public required int Otp { get; set; }
} 