using HealthHub.Source.Models.Dtos;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;

namespace HealthHub.Source.Services;

public interface IContactService
{
    Task<bool> SubmitContactFormAsync(ContactFormDto formData);
    Task<ContactInfoDto> GetContactInfoAsync();
}

public class ContactService : IContactService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ContactService> _logger;

    public ContactService(IConfiguration configuration, ILogger<ContactService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SubmitContactFormAsync(ContactFormDto formData)
    {
        try
        {
            // Get email settings from configuration
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var smtpServer = smtpSettings["Server"];
            var smtpPort = int.Parse(smtpSettings["Port"]);
            var smtpUsername = smtpSettings["Username"];
            var smtpPassword = smtpSettings["Password"];
            var adminEmail = smtpSettings["AdminEmail"];

            if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(smtpUsername) || 
                string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(adminEmail))
            {
                _logger.LogError("SMTP configuration is incomplete. Please check appsettings.json");
                throw new InvalidOperationException("SMTP configuration is incomplete");
            }

            _logger.LogInformation($"Attempting to send email using SMTP server: {smtpServer}:{smtpPort}");

            using var client = new SmtpClient(smtpServer, smtpPort)
            {
                EnableSsl = true,
                Credentials = new System.Net.NetworkCredential(smtpUsername, smtpPassword),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 10000 // 10 seconds timeout
            };

            var message = new MailMessage
            {
                From = new MailAddress(formData.Email, $"{formData.FirstName} {formData.LastName}"),
                Subject = "New Contact Form Submission",
                Body = $@"
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> {formData.FirstName} {formData.LastName}</p>
                    <p><strong>Email:</strong> {formData.Email}</p>
                    <p><strong>Phone:</strong> {formData.Phone}</p>
                    <p><strong>Message:</strong></p>
                    <p>{formData.Message}</p>
                ",
                IsBodyHtml = true
            };

            message.To.Add(adminEmail);

            try
            {
                await client.SendMailAsync(message);
                _logger.LogInformation("Contact form email sent successfully");
                return true;
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, $"SMTP error while sending email: {smtpEx.Message}");
                throw new InvalidOperationException($"Failed to send email: {smtpEx.Message}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending contact form email");
            throw; // Rethrow to be handled by the controller
        }
    }

    public async Task<ContactInfoDto> GetContactInfoAsync()
    {
        try
        {
            // Get contact info from configuration
            var contactInfo = _configuration.GetSection("ContactInfo");
            
            if (contactInfo == null)
            {
                _logger.LogError("ContactInfo section not found in configuration");
                throw new InvalidOperationException("ContactInfo configuration section is missing");
            }

            var phone = contactInfo["Phone"];
            var email = contactInfo["Email"];
            var alternatePhone = contactInfo["AlternatePhone"];
            var alternateEmail = contactInfo["AlternateEmail"];

            if (string.IsNullOrEmpty(phone) || string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("Some contact information is missing in configuration");
            }

            return new ContactInfoDto
            {
                Phone = phone ?? "+1 (555) 123-4567",
                Email = email ?? "contact@healthhub.com",
                AlternatePhone = alternatePhone ?? "+1 (555) 987-6543",
                AlternateEmail = alternateEmail ?? "support@healthhub.com"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contact information");
            throw;
        }
    }
} 