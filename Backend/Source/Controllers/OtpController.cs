using HealthHub.Source.Models.Dtos;
using HealthHub.Source.Models.Responses;
using HealthHub.Source.Services;
using Microsoft.AspNetCore.Mvc;

namespace HealthHub.Source.Controllers;

[ApiController]
[Route("api")]
public class OtpController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserService _userService;
    private readonly ILogger<OtpController> _logger;

    public OtpController(
        AuthService authService,
        UserService userService,
        ILogger<OtpController> logger)
    {
        _authService = authService;
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Sends an OTP to the user's email address
    /// </summary>
    /// <param name="email">The email address to send the OTP to</param>
    /// <returns>Success message if OTP was sent successfully</returns>
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<string>(false, "Invalid email address", null));
            }

            var user = await _userService.GetUserByEmail(request.Email);
            if (user == null)
            {
                return NotFound(new ApiResponse<string>(false, "User not found", null));
            }

            await _authService.SendOtp(user.UserId);
            return Ok(new ApiResponse<string>(true, "OTP sent successfully", null));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP");
            return StatusCode(500, new ApiResponse<string>(false, "Failed to send OTP", null));
        }
    }

    /// <summary>
    /// Verifies the OTP entered by the user
    /// </summary>
    /// <param name="request">The OTP verification request containing email and OTP</param>
    /// <returns>Success message if OTP was verified successfully</returns>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<string>(false, "Invalid request", null));
            }

            var user = await _userService.GetUserByEmail(request.Email);
            if (user == null)
            {
                return NotFound(new ApiResponse<string>(false, "User not found", null));
            }

            if (user.Otp != request.Otp)
            {
                return BadRequest(new ApiResponse<string>(false, "Invalid OTP", null));
            }

            // Clear the OTP after successful verification
            user.Otp = null;
            user.IsEmailVerified = true;
            await _userService.UpdateUser(user);

            return Ok(new ApiResponse<string>(true, "OTP verified successfully", null));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify OTP");
            return StatusCode(500, new ApiResponse<string>(false, "Failed to verify OTP", null));
        }
    }
} 