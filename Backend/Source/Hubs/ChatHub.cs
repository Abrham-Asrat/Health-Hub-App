using System.ComponentModel.DataAnnotations;
using HealthHub.Source.Helpers.Defaults;
using HealthHub.Source.Helpers.Extensions;
using HealthHub.Source.Services;
using HealthHub.Source.Services.ChatService;
using Microsoft.AspNetCore.SignalR;
using Org.BouncyCastle.Asn1.Cms;
using Serilog;

namespace HealthHub.Source.Hubs
{
  public class ChatHub : Hub
  {
    private readonly IChatService _chatService;
    private readonly UserConnection _userConnection;
    private readonly ILogger<ChatHub> _logger;
    private string? _senderId;

    public ChatHub(
      ChatService chatService, 
      UserConnection userConnection,
      ILogger<ChatHub> logger)
    {
      _chatService = chatService ?? throw new ArgumentNullException(nameof(chatService));
      _userConnection = userConnection ?? throw new ArgumentNullException(nameof(userConnection));
      _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public override async Task OnConnectedAsync()
    {
      try
      {
        var httpContext = Context.GetHttpContext();
        if (httpContext == null)
        {
          _logger.LogError("HttpContext is null in OnConnectedAsync");
          Context.Abort();
          return;
        }

        // Log all cookies and headers for debugging
        _logger.LogInformation("Cookies: {Cookies}", string.Join(", ", httpContext.Request.Cookies.Select(c => $"{c.Key}={c.Value}")));
        _logger.LogInformation("Headers: {Headers}", string.Join(", ", httpContext.Request.Headers.Select(h => $"{h.Key}={h.Value}")));
        _logger.LogInformation("Connection ID: {ConnectionId}", Context.ConnectionId);
        _logger.LogInformation("User: {User}", httpContext.User?.Identity?.Name);
        _logger.LogInformation("User Claims: {Claims}", string.Join(", ", httpContext.User?.Claims.Select(c => $"{c.Type}={c.Value}")));

        // Try to get user ID from Authorization header first
        var authHeader = httpContext.Request.Headers["Authorization"].ToString();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
          var token = authHeader.Substring("Bearer ".Length);
          _logger.LogInformation("Found Bearer token: {Token}", token);
          
          // Try to get user ID from token claims
          var userIdClaim = httpContext.User.FindFirst("sub")?.Value;
          if (!string.IsNullOrEmpty(userIdClaim))
          {
            // Check if this is a client credentials token
            var grantType = httpContext.User.FindFirst("gt")?.Value;
            if (grantType == "client-credentials")
            {
              _logger.LogWarning("Client credentials token detected. This token type is not supported for chat connections.");
              Context.Abort();
              return;
            }

            _senderId = userIdClaim;
            _logger.LogInformation("Found user ID from token claim: {UserId}", _senderId);
          }
          else
          {
            _logger.LogWarning("No user ID found in token claims");
          }
        }
        else
        {
          _logger.LogWarning("No Bearer token found in Authorization header");
        }

        // If no user ID from token, try cookie
        if (string.IsNullOrEmpty(_senderId))
        {
          _senderId = httpContext.Request.Cookies[CookieDefaults.Profile.UserId];
          if (!string.IsNullOrEmpty(_senderId))
          {
            _logger.LogInformation("Found user ID from cookie: {UserId}", _senderId);
          }
          else
          {
            _logger.LogWarning("No user ID found in cookie");
          }
        }

        if (string.IsNullOrEmpty(_senderId))
        {
          _logger.LogWarning("Connection attempt without user ID");
          Context.Abort();
          return;
        }

        _userConnection.AddConnection(_senderId, Context.ConnectionId);
        _logger.LogInformation("User {UserId} connected with connection ID {ConnectionId}", _senderId, Context.ConnectionId);
        await base.OnConnectedAsync();
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in OnConnectedAsync");
        Context.Abort();
      }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
      try
      {
        if (_senderId != null)
        {
          _userConnection.RemoveConnection(_senderId);
          _logger.LogInformation("User {UserId} disconnected", _senderId);
        }

        if (exception != null)
        {
          _logger.LogError(exception, "Connection closed with error");
          _logger.LogError("Connection ID: {ConnectionId}", Context.ConnectionId);
          _logger.LogError("User: {User}", Context.User?.Identity?.Name);
        }

        await base.OnDisconnectedAsync(exception);
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in OnDisconnectedAsync");
      }
    }

    /// <summary>
    /// Sends a message to a user specified by the receiverId
    /// </summary>
    /// <param name="conversationId"></param>
    /// <param name="messageText"></param>
    /// <param name="files"></param>
    /// <returns></returns>
    /// <exception cref="ArgumentException"></exception>
    /// <exception cref="FormatException"></exception>
    public async Task SendMessage(
      [Guid] Guid conversationId,
      [MinLength(1, ErrorMessage = "Message text cannot be empty")] string? messageText = null,
      [ValidCreateFileList] List<CreateFileDto>? files = null
    )
    {
      try
      {
        if (string.IsNullOrWhiteSpace(_senderId))
        {
          _logger.LogWarning("SendMessage attempt without user ID");
          throw new HubException("User is not authenticated");
        }

        if (string.IsNullOrWhiteSpace(messageText) && (files == null || files.Count == 0))
        {
          throw new ArgumentException("Either message text or files must be provided.");
        }

        if (!Guid.TryParse(_senderId, out Guid senderGuid))
        {
          _logger.LogWarning("Invalid user ID format: {UserId}", _senderId);
          throw new HubException("Invalid user ID format");
        }

        var messagePayload = new CreateMessageDto(conversationId, senderGuid, messageText, files);
        var createdMessage = await _chatService.CreateMessageAsync(messagePayload);

        var connId = _userConnection.GetConnectionId(_senderId);
        if (connId != null)
        {
          await Clients
            .Client(connId)
            .SendAsync(ChatEvents.ReceiveMessage.ToString(), createdMessage);
        }
        else
        {
          _logger.LogWarning("No connection ID found for user {UserId}", _senderId);
          throw new HubException("User connection not found");
        }
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in SendMessage");
        throw new HubException($"Error sending message: {ex.Message}");
      }
    }

    public async Task SendMessageAll(string user, string message)
    {
      await Clients.All.SendAsync("ReceiveMessageAll", user, message);
    }
  }
}
