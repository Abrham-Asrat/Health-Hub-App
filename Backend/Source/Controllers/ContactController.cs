using HealthHub.Source.Models.Dtos;
using HealthHub.Source.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthHub.Source.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(IContactService contactService, ILogger<ContactController> logger)
    {
        _contactService = contactService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitContactForm([FromBody] ContactFormDto formData)
    {
        try
        {
            var result = await _contactService.SubmitContactFormAsync(formData);
            return Ok(new { success = true, message = "Message sent successfully" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Error processing contact form submission");
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing contact form submission");
            return StatusCode(500, new { success = false, message = "An error occurred while processing your request. Please try again later." });
        }
    }

    [HttpGet("info")]
    public async Task<IActionResult> GetContactInfo()
    {
        try
        {
            var contactInfo = await _contactService.GetContactInfoAsync();
            return Ok(new { success = true, data = contactInfo });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contact information");
            return StatusCode(500, new { success = false, message = "An error occurred while retrieving contact information" });
        }
    }
} 