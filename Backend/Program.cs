using dotenv.net;
using FluentValidation;
using HealthHub.Source.Config;
using HealthHub.Source.Data;
using HealthHub.Source.Filters.Error;
using HealthHub.Source.Helpers.Extensions;
using HealthHub.Source.Hubs;
using HealthHub.Source.Services;
using HealthHub.Source.Services.BlogService;
using HealthHub.Source.Services.ChatService;
using HealthHub.Source.Services.PaymentProviders;
using HealthHub.Source.Services.PaymentService;
using HealthHub.Source.Services.ReviewService;
using HealthHub.Source.Validation;
using HealthHub.Source.Validation.AppointmentValidation;
using HealthHub.Source.Validation.UserValidation;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Converters;
using Org.BouncyCastle.Asn1.X509.Qualified;
using Serilog;

// Load Environment Variables
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (!File.Exists(envPath))
{
    throw new FileNotFoundException(".env file not found. Please create a .env file in the Backend directory with the required configuration.");
}

DotEnv.Load(options: new DotEnvOptions(ignoreExceptions: false, envFilePaths: new[] { envPath }));

// Debug Auth0 Configuration
var auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN");
var auth0Audience = Environment.GetEnvironmentVariable("AUTH0_AUDIENCE");
var auth0ClientId = Environment.GetEnvironmentVariable("AUTH0_CLIENT_ID");
var auth0ClientSecret = Environment.GetEnvironmentVariable("AUTH0_CLIENT_SECRET");

if (string.IsNullOrEmpty(auth0Domain) || string.IsNullOrEmpty(auth0Audience) || 
    string.IsNullOrEmpty(auth0ClientId) || string.IsNullOrEmpty(auth0ClientSecret))
{
    throw new InvalidOperationException(
        "Auth0 configuration is missing. Please ensure the following environment variables are set in your .env file:\n" +
        "AUTH0_DOMAIN\n" +
        "AUTH0_AUDIENCE\n" +
        "AUTH0_CLIENT_ID\n" +
        "AUTH0_CLIENT_SECRET"
    );
}

var builder = WebApplication.CreateBuilder(args);

{
  // Configure Serilog with appropriate sinks
  Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug() // Set the minimum log level to Debug
    .WriteTo.Console() // Write logs to the console
    .WriteTo.File("Logs/HealthHub.log", rollingInterval: RollingInterval.Day) // Write logs to a file
    .WriteTo.Seq("http://localhost:5341/") // Write logs to Seq
    .CreateLogger();

  Log.Information("Application Starting...");

  // Configure Serilog to capture logs from application host
  builder.Host.UseSerilog();

  // Database Service
  builder.Services.AddDbContext<ApplicationContext>(
    (serviceProvider, options) =>
    {
      var appConfig = serviceProvider.GetRequiredService<AppConfig>();
      var connectionString = appConfig.DatabaseConnection;
      if (string.IsNullOrEmpty(connectionString))
      {
        throw new InvalidOperationException("DB_CONNECTION environment variable is not set.");
      }
      Log.Information($"This is the conn str: {connectionString}");
      options.UseSqlServer(connectionString, sqlOptions =>
      {
        sqlOptions.EnableRetryOnFailure(
          maxRetryCount: 3,
          maxRetryDelay: TimeSpan.FromSeconds(30),
          errorNumbersToAdd: null);
      });
    },
    ServiceLifetime.Scoped  // Explicitly set to Scoped
  );

  builder.Services.Configure<ApiBehaviorOptions>(options =>
  {
    // Model state invalid filter disable
    // options.SuppressModelStateInvalidFilter = true;
  });

  builder.Services.AddCors(
    (options) =>
    {
      options.AddPolicy(
        "AllowAngularApp",
        b =>
        {
          var config = new AppConfig(builder.Configuration);
          Log.Logger.Information($"\n\nALlowedOrigins: {config.AllowedOrigins}");

          b.WithOrigins(config.AllowedOrigins)
           .AllowAnyMethod()
           .AllowAnyHeader()
           .AllowCredentials()
           .SetIsOriginAllowed(origin => true); // For development only
        }
      );
    }
  );

  /*
      Add Services to the Container
  */

  // Configure authentication with JWT and Auth0
  builder.Services.AddAuthentication(options =>
  {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
  })
  .AddJwtBearer(options =>
  {
    var appConfig = new AppConfig(builder.Configuration);
    
    if (string.IsNullOrEmpty(appConfig.Auth0Domain))
    {
        throw new InvalidOperationException("AUTH0_DOMAIN environment variable is not set.");
    }
    
    if (string.IsNullOrEmpty(appConfig.Auth0Audience))
    {
        throw new InvalidOperationException("AUTH0_AUDIENCE environment variable is not set.");
    }

    options.Authority = $"https://{appConfig.Auth0Domain}/";
    options.Audience = appConfig.Auth0Audience;
    options.RequireHttpsMetadata = appConfig.IsProduction ?? false;

    Log.Information($"\nAuth0 Configuration:");
    Log.Information($"\nAudience: {options.Audience}");
    Log.Information($"\nAuthority: {options.Authority}");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = $"https://{appConfig.Auth0Domain}/",
        ValidAudience = appConfig.Auth0Audience,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Log.Error($"Authentication failed: {context.Exception.Message}");
            Log.Error($"Exception details: {context.Exception}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Log.Information("Token validated successfully");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Log.Warning($"Challenge issued: {context.Error}, {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
  });

  // Configure Authorization
  builder.Services.AddAuthorization(options =>
  {
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("Doctor", policy => policy.RequireRole("Doctor"));
    options.AddPolicy("Patient", policy => policy.RequireRole("Patient"));
  });

  // Controllers & Views Service
  builder.Services.AddControllersWithViews(options =>
  {
    // Global action filter for validating each controller
    options.Filters.Add<ValidateModelStateFilter>();
  });

  // Register Validation Services
  builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserDtoValidator>();
  builder.Services.AddValidatorsFromAssemblyContaining<CreateAppointmentDtoValidator>();
  builder.Services.AddValidatorsFromAssemblyContaining<EditAppointmentDtoValidator>();
  builder.Services.AddValidatorsFromAssemblyContaining<EditProfileDtoValidator>();

  // Register the App Configuration Service
  builder.Services.AddSingleton<AppConfig>(provider =>
  {
    var config = provider.GetRequiredService<IConfiguration>();
    return new AppConfig(config);
  });

  // This service allows you to access the HttpContext in classes that
  // are not directly part of the HTTP request pipeline
  builder.Services.AddHttpContextAccessor();

  // Register the signalr service for realtime comms
  builder.Services.AddSignalR(options =>
  {
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 102400; // 100 KB
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);
    options.KeepAliveInterval = TimeSpan.FromSeconds(10);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
  })
  .AddJsonProtocol(options =>
  {
    options.PayloadSerializerOptions.PropertyNamingPolicy = null;
  });

  // Configure CORS
  builder.Services.AddCors(options =>
  {
    options.AddPolicy("AllowAngularApp", corsBuilder =>
    {
      corsBuilder
        .WithOrigins(builder.Configuration.GetValue<string>("AppConfig:AllowedOrigins")?.Split(',') ?? new[] { "http://localhost:4200" })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .SetIsOriginAllowed(origin => true); // For development only
    });
  });

  // Register Services
  builder.Services.AddScoped<UserService>();
  builder.Services.AddScoped<DoctorService>();
  builder.Services.AddScoped<PatientService>();
  builder.Services.AddScoped<AdminService>();
  builder.Services.AddScoped<IContactService, ContactService>();

  builder.Services.AddScoped<IChatService, ChatService>();

  builder.Services.AddScoped<AppointmentService>();

  builder.Services.AddScoped<SpecialityService>();
  builder.Services.AddScoped<DoctorSpecialityService>();

  builder.Services.AddScoped<AuthService>();
  builder.Services.AddScoped<Auth0Service>();

  builder.Services.AddScoped<EmailService>();
  builder.Services.AddScoped<FileService>();
  builder.Services.AddScoped<RenderingService>();

  builder.Services.AddSingleton<UserConnection>();

  builder.Services.AddScoped<IPaymentService, PaymentService>();
  builder.Services.AddScoped<IPaymentProvider, ChapaPaymentProvider>();
  builder.Services.AddScoped<IPaymentProviderFactory, PaymentProviderFactory>();

  builder.Services.AddScoped<IBlogService, BlogService>();
  builder.Services.AddScoped<IReviewService, ReviewService>();

  // Add other providers in the future here!

  // This line registers the Lazy<T> type with the DI container to enable lazy loading for services.
  builder.Services.AddTransient(typeof(Lazy<>), typeof(Lazy<>));

  builder
    .Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
      options.SerializerSettings.ReferenceLoopHandling = Newtonsoft
        .Json
        .ReferenceLoopHandling
        .Ignore;
      options.SerializerSettings.Converters.Add(
        new Newtonsoft.Json.Converters.StringEnumConverter()
      );
      options.SerializerSettings.Converters.Add(new IsoDateTimeConverter());
    });

  builder.Services.AddEndpointsApiExplorer();
  builder.Services.AddSwaggerGen(options =>
  {
    var xmlFile = "HealthHub.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
  });

  builder
    .Services.AddRazorPages()
    .AddRazorOptions(options =>
    {
      options.ViewLocationFormats.Add("/Source/Views/{0}.cshtml");
    });

  builder.Logging.AddFilter("Microsoft.AspNetCore.SignalR", LogLevel.Debug);
  builder.Logging.AddFilter("Microsoft.AspNetCore.Http.Connections", LogLevel.Debug);

  // Close and Flush Serilog when the application exits
  AppDomain.CurrentDomain.ProcessExit += (s, e) => Log.CloseAndFlush();

  //----------------------------------------
}

var app = builder.Build();

{
  // app.UseExceptionHandler("/error"); // Exception handling endpoint

  app.UseSerilogRequestLogging(); // Enable Serilog Request Logging

  app.UseCors("AllowAngularApp");

  // Middlewares
  app.UseCustomValidation(); // Register the Custom Validation Middleware
  app.UseCookieMiddleware(); // Register the Cookie Middleware

  app.UseAuthentication();
  app.UseAuthorization();

  app.MapControllers();
  app.MapHub<ChatHub>("/chatHub", options =>
  {
    options.CloseOnAuthenticationExpiration = true;
    options.ApplicationMaxBufferSize = 102400; // 100 KB
    options.TransportMaxBufferSize = 102400; // 100 KB
  })
  .RequireAuthorization(); // Add authorization requirement

  app.MapHub<NotificationHub>("/notificationHub")
    .RequireAuthorization(); // Add authorization requirement

  if (app.Environment.IsDevelopment())
  {
    app.UseSwagger();
    app.UseSwaggerUI();
  }

  app.Run(new AppConfig(app.Configuration).ApiOrigin);
}
