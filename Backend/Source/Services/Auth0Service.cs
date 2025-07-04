using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using System.Text.Json.Nodes;
using HealthHub.Source.Config;
using HealthHub.Source.Helpers.Extensions;
using HealthHub.Source.Models.Dtos;
using HealthHub.Source.Models.Enums;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Org.BouncyCastle.Asn1.Ocsp;
using RestSharp;

namespace HealthHub.Source.Services;

public class Auth0Service(AppConfig appConfig, ILogger<Auth0Service> logger)
{
  /// <summary>
  /// Responsible for creating a new user in the Auth0 database.
  /// </summary>
  /// <param name="userDto"></param>
  /// <param name="userId"></param>
  /// <returns>Newly created auth0 UserID</returns>
  public async Task<Auth0UserDto?> CreateUserAsync(RegisterUserDto userDto, Guid userId)
  {
    try
    {
      var userPayload = new
      {
        email = userDto.Email,
        password = userDto.Password,
        connection = "Username-Password-Authentication",
        user_metadata = new
        {
          userId,
          firstName = userDto.FirstName,
          lastName = userDto.LastName,
          role = userDto.Role.ToString(),
          phone = userDto.Phone,
          gender = userDto.Gender,
          dateOfBirth = userDto.DateOfBirth,
        }
      };

      var token = await GetManagementApiTokenAsync();

      Func<Task<RestResponse>> MakeRequest = async () =>
      {
        var client = new RestClient($"{appConfig.Auth0Authority}/api/v2/users");
        var request = new RestRequest() { Method = Method.Post };
        request.AddHeader("content-type", "application/json");
        request.AddHeader("Authorization", $"Bearer {token}");
        request.AddJsonBody(userPayload);

        return await client.ExecuteAsync(request);
      };

      var response = await MakeRequest();

      if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
      {
        // Delete the user with the given email from auth0
        await DeleteUserByEmailAsync(userDto.Email);
        // make the request again
        response = await MakeRequest();
      }

      if (!response.IsSuccessStatusCode)
      {
        logger.LogError(response.Content, $"Auth0 Create User Error\n\n");
        throw new Exception(
          $"Failed to create user in Auth0. Please check auth0 dashboard / user management"
        );
      }

      var userData = JsonSerializer.Deserialize<JsonElement>(response.Content!);
      logger.LogInformation($"\n\nAuth0 Create User Success:\n {response.Content}");

      return new Auth0UserDto(
        userData.GetProperty("user_id").GetString()!,
        userData.GetProperty("picture").GetString()!,
        userData.GetProperty("email_verified").GetBoolean()
      );
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to create user in Auth0");
      throw;
    }
  }

  public async Task DeleteUserAsync(string userId)
  {
    try
    {
      var token = await GetManagementApiTokenAsync();

      var client = new RestClient($"{appConfig.Auth0Authority}/api/v2/users/{userId}");
      var request = new RestRequest() { Method = Method.Delete };

      request.AddHeader("Authorization", $"Bearer {token}");

      var response = await client.ExecuteAsync(request);

      if (response.StatusCode != System.Net.HttpStatusCode.NoContent)
      {
        logger.LogError(response.Content, $"Auth0 Delete User Error");
        throw new Exception("Failed to delete user in Auth0");
      }

      logger.LogInformation($"Auth0 Delete User Success:\n {response.Content}");
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to delete user in Auth0");
      throw;
    }
  }

  public async Task DeleteUserByEmailAsync(string email)
  {
    try
    {
      var token = await GetManagementApiTokenAsync();

      // Initialize RestClient to search for the user by email
      var searchClient = new RestClient($"{appConfig.Auth0Authority}/api/v2/users-by-email");
      var searchRequest = new RestRequest { Method = Method.Get };

      searchRequest.AddHeader("Authorization", $"Bearer {token}");
      searchRequest.AddParameter("email", email);

      var searchResponse = await searchClient.ExecuteAsync(searchRequest);

      if (searchResponse.StatusCode != System.Net.HttpStatusCode.OK)
      {
        logger.LogError(searchResponse.Content, "Auth0 Search User Error");
        throw new Exception("Failed to search user by email in Auth0");
      }

      // Parse the response to get the user ID
      var responseBody = searchResponse.Content;
      var users = JArray.Parse(responseBody);

      if (users.Count == 0)
      {
        throw new Exception("User not found");
      }

      var userId = users.First["user_id"].ToString(); // Extract user ID

      // Call the existing DeleteUserAsync method
      await DeleteUserAsync(userId);
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to delete user by email in Auth0");
      throw;
    }
  }

  public async Task<Auth0LoginDto?> LoginUserAsync(LoginUserDto loginUserDto, string auth0UserId)
  {
    try
    {
      var client = new RestClient($"{appConfig.Auth0Authority}/oauth/token");
      var request = new RestRequest() { Method = Method.Post };

      request.AddHeader("content-type", "application/x-www-form-urlencoded");
      request.AddParameter("grant_type", "client_credentials");
      request.AddParameter("username", loginUserDto.Email);
      request.AddParameter("password", loginUserDto.Password);
      request.AddParameter("audience", appConfig.Auth0Audience);
      request.AddParameter("client_id", appConfig.Auth0ClientId);
      request.AddParameter("client_secret", appConfig.Auth0ClientSecret);
      request.AddParameter("connection", "Username-Password-Authentication");

      var response = await client.ExecuteAsync(request);

      logger.LogInformation($"\n\nAuth0 Login User Response:\n {response.Content}");

      if (!response.IsSuccessStatusCode)
      {
        var errorData = JsonSerializer.Deserialize<JsonElement>(response.Content!);
        var errorMessage = errorData.TryGetProperty("error_description", out var errorDesc) 
          ? errorDesc.GetString() 
          : "Failed to login user";
        throw new Exception(errorMessage);
      }

      var responseData = JsonSerializer.Deserialize<JsonElement>(response.Content!);
      var profile = await GetUserProfileAsync(auth0UserId);

      return new Auth0LoginDto(
        responseData.GetProperty("access_token").ToString(),
        responseData.GetProperty("expires_in").GetInt32(),
        profile
      );
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to login user in Auth0");
      throw;
    }
  }

  public async Task<bool?> IsEmailVerified(string userId)
  {
    try
    {
      var token = await GetManagementApiTokenAsync();

      var client = new RestClient($"{appConfig.Auth0Authority}/api/v2/users/{userId}");
      var request = new RestRequest() { Method = Method.Get };

      request.AddHeader("Authorization", $"Bearer {token}");

      var response = await client.ExecuteAsync(request);

      if (!response.IsSuccessStatusCode)
      {
        logger.LogError(response.Content, $"Auth0 Get User Error for email verification");
        throw new Exception("Failed to get user in Auth0 for email verification");
      }

      return JsonSerializer
        .Deserialize<JsonElement>(response.Content!)
        .GetProperty("email_verified")
        .GetBoolean();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to verify email in Auth0");
      throw;
    }
  }

  public async Task<Auth0ProfileDto> GetUserProfileAsync(string auth0Id)
  {
    try
    {
      var token = await GetManagementApiTokenAsync();

      var url = $"{appConfig.Auth0Authority}/api/v2/users/{auth0Id}";
      var restClient = new RestClient(url);

      var restRequest = new RestRequest() { Method = Method.Get };
      restRequest.AddHeader("Authorization", $"Bearer {token}");

      var response = await restClient.ExecuteAsync(restRequest);

      if (!response.IsSuccessStatusCode)
      {
        throw new Exception("Failed to get auth0 user profile");
      }

      var jsonData = JsonSerializer.Deserialize<JsonElement>(response.Content!);

      logger.LogInformation(response.Content);

      if (!jsonData.TryGetProperty("user_metadata", out var userMetaData))
      {
        throw new Exception("User metadata is not present in the response");
      }

      // Use TryGetProperty to handle missing fields gracefully

      var userId = userMetaData.TryGetProperty("userId", out var userIdElement)
        ? Guid.TryParse(userIdElement.GetString(), out var userGuid)
          ? userGuid
          : Guid.Empty
        : Guid.Empty;

      var firstName = userMetaData.TryGetProperty("firstName", out var firstNameElement)
        ? firstNameElement.GetString()
        : "";
      var lastName = userMetaData.TryGetProperty("lastName", out var lastNameElement)
        ? lastNameElement.GetString()
        : "";
      var role = userMetaData.TryGetProperty("role", out var roleElement)
        ? roleElement.GetString()
        : "";
      var phone = userMetaData.TryGetProperty("phone", out var phoneElement)
        ? phoneElement.GetString()
        : "";
      var gender = userMetaData.TryGetProperty("gender", out var genderElement)
        ? genderElement.GetString()
        : "";
      var dateOfBirth = userMetaData.TryGetProperty("dateOfBirth", out var dateOfBirthElement)
        ? dateOfBirthElement.GetString()
        : "";

      return new Auth0ProfileDto
      {
        UserId = userId,
        FirstName = firstName,
        LastName = lastName,
        Role = string.IsNullOrEmpty(role) ? default : role.ConvertToEnum<Role>(),
        Phone = phone,
        Gender = string.IsNullOrEmpty(gender) ? default : gender.ConvertToEnum<Gender>(),
        DateOfBirth = dateOfBirth
      };
    }
    catch (Exception ex)
    {
      logger.LogError($"{ex}: AN error occured trying to get auth0 profile");
      throw;
    }
  }

  /// <summary>
  /// Responsible for getting the management access token for making management API calls.
  /// </summary>
  /// <returns></returns>
  public async Task<string> GetManagementApiTokenAsync()
  {
    var clientId = appConfig.Auth0ClientId;
    var clientSecret = appConfig.Auth0ClientSecret;
    var managementApiAudience = $"{appConfig.Auth0Authority}/api/v2/";
    var url = $"{appConfig.Auth0Authority}/oauth/token";

    var client = new RestClient(url);
    logger.LogInformation($"Auth0 Get Management API Token Request:\n URL: {url}\nAudience: {managementApiAudience}");

    var request = new RestRequest() { Method = Method.Post };

    request.AddHeader("content-type", "application/x-www-form-urlencoded");
    request.AddParameter("grant_type", "client_credentials");
    request.AddParameter("client_id", clientId);
    request.AddParameter("client_secret", clientSecret);
    request.AddParameter("audience", managementApiAudience);

    RestResponse response = await client.ExecuteAsync(request);
    logger.LogInformation($"\n\nManagement API Response: {response.Content}");
    
    if (!response.IsSuccessStatusCode)
    {
      logger.LogError(response.Content, $"Auth0 Get Management API Token Error");
      throw new Exception($"Failed to get management API token: {response.Content}");
    }

    var tokenData = JsonSerializer.Deserialize<JsonElement>(response.Content!);
    return tokenData.GetProperty("access_token").GetString()!;
  }

  public async Task<bool> VerifyPasswordAsync(string email, string password)
  {
    try
    {
      var client = new RestClient($"{appConfig.Auth0Authority}/oauth/token");
      var request = new RestRequest() { Method = Method.Post };

      request.AddHeader("content-type", "application/json");
      request.AddBody(
        new
        {
          grant_type = "client_credentials",
          username = email,
          password = password,
          audience = appConfig.Auth0Audience,
          client_id = appConfig.Auth0ClientId,
          client_secret = appConfig.Auth0ClientSecret
        }
      );

      var response = await client.ExecuteAsync(request);
      return response.IsSuccessStatusCode;
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to verify password in Auth0");
      return false;
    }
  }

  public async Task<bool> ChangePasswordAsync(string email, string newPassword)
  {
    try
    {
      var token = await GetManagementApiTokenAsync();
      var user = await GetUserByEmailAsync(email);

      if (user == null)
      {
        return false;
      }

      var client = new RestClient($"{appConfig.Auth0Authority}/api/v2/users/{user.UserId}");
      var request = new RestRequest() { Method = Method.Patch };

      request.AddHeader("Authorization", $"Bearer {token}");
      request.AddHeader("content-type", "application/json");
      request.AddBody(new { password = newPassword });

      var response = await client.ExecuteAsync(request);
      return response.IsSuccessStatusCode;
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to change password in Auth0");
      return false;
    }
  }

  private async Task<Auth0UserDto?> GetUserByEmailAsync(string email)
  {
    try
    {
      var token = await GetManagementApiTokenAsync();
      var client = new RestClient($"{appConfig.Auth0Authority}/api/v2/users-by-email");
      var request = new RestRequest() { Method = Method.Get };

      request.AddHeader("Authorization", $"Bearer {token}");
      request.AddParameter("email", email);

      var response = await client.ExecuteAsync(request);
      if (!response.IsSuccessStatusCode)
      {
        return null;
      }

      var users = JArray.Parse(response.Content!);
      if (users.Count == 0)
      {
        return null;
      }

      var user = users[0];
      return new Auth0UserDto(
        user["user_id"]!.ToString()!,
        user["picture"]?.ToString() ?? "",
        user["email_verified"]?.ToObject<bool>() ?? false
      );
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get user by email from Auth0");
      return null;
    }
  }
}
