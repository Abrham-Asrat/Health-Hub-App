using System;
using System.IO;
using System.Threading.Tasks;
using HealthHub.Source.Models.Responses;
using HealthHub.Source.Services.PaymentService;
using HealthHub.Source.Helpers.Defaults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

// These were missing:
using HealthHub.Source.Models.Dtos;
using HealthHub.Source.Helpers;
using HealthHub.Source.Config;
using HealthHub.Source.Models.Interfaces.Payments;
using HealthHub.Source.Helpers.Extensions;

namespace HealthHub.Source.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public partial class PaymentController(
        IPaymentService paymentService,
        ILogger<PaymentController> logger,
        AppConfig appConfig
    ) : ControllerBase
    {
        [HttpPost("transfer")]
        public async Task<IActionResult> TransferBalance(TransferRequestDto transferRequestDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                var userId = Request.Cookies[CookieDefaults.Profile.UserId]?.ToString();

                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentException("Either you haven't logged in or the cookie for userId is missing.");
                }

                if (!Guid.TryParse(userId, out var senderId))
                {
                    throw new FormatException("Invalid userId format. Please login again.");
                }

                var result = await paymentService.TransferAsync(transferRequestDto, senderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error transferring balance");
                throw;
            }
        }

        [HttpPost("charge")]
        public async Task<IActionResult> ChargeCustomer(ChargeRequest chargeRequest)
        {
            try
            {
                var result = await paymentService.ChargeAsync(chargeRequest);
                return Ok(new ApiResponse<ChargeResponse>(result.Status, result.Message, result));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error charging customer");
                throw;
            }
        }

        /// <summary>
        /// Chapa Webhook Callback Endpoint
        /// </summary>
        [HttpPost("chapa/webhook")]
        public async Task<IActionResult> ChapaWebhook([FromBody] ChapaWebhookDto webhookData)
        {
            try
            {
                // Optional: Log raw request body for debugging
                using var reader = new StreamReader(Request.Body);
                var rawBody = await reader.ReadToEndAsync();
                logger.LogDebug("Raw webhook body: {Body}", rawBody);

                if (webhookData == null)
                {
                    logger.LogWarning("Received empty webhook payload");
                    return BadRequest("Invalid payload");
                }

                logger.LogInformation("Received Chapa webhook: {Event} | TxRef: {TxRef}",
                    webhookData.Event, webhookData.TxRef);

                // Verify signature if needed
                var chapaSignature = Request.Headers["Chapa-Signature"].ToString();
                var hash = EncryptionHelper.GetHmacSha256Hash(rawBody, appConfig.WebhookSecret 
                    ?? throw new Exception("No secret key configured."));

                if (hash != chapaSignature)
                {
                    logger.LogWarning("Invalid signature on webhook. Hash: {Hash}, Signature: {Signature}",
                        hash, chapaSignature);
                    return Unauthorized("Invalid signature");
                }

                // Only process successful payments
                if (webhookData.Event == "charge.success" && webhookData.Status == "success")
                {
                    await paymentService.VerifyAsync(new VerifyRequest
                    {
                        TransactionReference = webhookData.TxRef
                    });

                    logger.LogInformation("Successfully processed transaction reference: {TxRef}",
                        webhookData.TxRef);
                }

                // Always return 200 OK immediately after acknowledging receipt
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while processing Chapa webhook.");
                return StatusCode(500);
            }
        }
    }
}