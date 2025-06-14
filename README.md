# 👨‍⚕️ Health Hub 👩‍⚕️

<br>

# Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Folder Organization](#folder-organization)
- [Configurations](#configurations)
- [Setup](#setup)
- [Contributing](#contributing)
- [License](#license)

<br>

# Overview

HealthHub connects patients with doctors, enabling online consultations, appointment scheduling, and access to medical records. Features include medication reminders, health monitoring, health tips and much more.

<br>

# Technologies

## Frontend Technologies
1. **Framework**: ![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
2. **Language**: ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
3. **UI Components**: ![Angular Material](https://img.shields.io/badge/Angular%20Material-3F51B5?style=flat&logo=angular&logoColor=white)
4. **State Management**: ![RxJS](https://img.shields.io/badge/RxJS-B7178C?style=flat&logo=reactivex&logoColor=white)

## Backend Technologies
1. **Programming Language**: ![C#](https://img.shields.io/badge/C%23-8A2BE2?style=flat&logo=csharp&logoColor=white)
2. **Backend Framework**: ![ASP.NET](https://img.shields.io/badge/ASP.NET-purple?style=flat&logo=dotnet&logoColor=white)
3. **Authentication**: ![Auth0](https://img.shields.io/badge/Auth0-7D7D7D?style=flat&logo=auth0&logoColor=white)
4. **ORM**: ![EF Core](https://img.shields.io/badge/EF%20Core-7D3F8C?style=flat&logo=efcore&logoColor=white)
5. **Database**: ![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=flat&logo=microsoftsqlserver&logoColor=white)
6. **Logging**: ![Serilog](https://img.shields.io/badge/Serilog-7d7d7d?style=flat&logo=serilog&logoColor=white)
7. **Testing**: ![xUnit](https://img.shields.io/badge/xUnit-6e6e6e?style=flat&logo=xunit&logoColor=white)
8. **API Documentation**: ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black)

<br>

# Folder Organization

## Frontend Structure
```
Frontend/
├── 📁src/
│   ├── 📁app/
│   │   ├── 📁components/
│   │   ├── 📁services/
│   │   ├── 📁models/
│   │   ├── 📁guards/
│   │   ├── 📁interceptors/
│   │   └── 📁shared/
│   ├── 📁assets/
│   ├── 📁environments/
│   └── 📁styles/
├── 📁e2e/
└── 📁node_modules/
```

## Backend Structure
```
Backend/
├── 📁Migrations/
├── 📁Requests/
├── 📁Source/
│   ├── 📁Attributes/
│   ├── 📁Config/
│   ├── 📁Controllers/
│   ├── 📁Data/
│   ├── 📁Filters/
│   ├── 📁Helpers/
│   │   ├── 📁Defaults/
│   │   └── 📁Extensions/
│   ├── 📁Hubs/
│   ├── 📁Middlewares/
│   ├── 📁Models/
│   │   ├── 📁Dtos/
│   │   ├── 📁Entities/
│   │   ├── 📁Enums/
│   │   ├── 📁Interfaces/
│   │   ├── 📁Responses/
│   │   └── 📁ViewModels/
│   ├── 📁Services/
│   ├── 📁Validation/
│   └── 📁Views/
├── 📁Tests/
└── Program.cs
```

## Detailed Backend Structure Explanation

- **Migrations/**: Database model migrations
- **Requests/**: REST client HTTP API tests
- **Source/**: Main source code directory
  - **Attributes/**: Custom validation attributes
  - **Config/**: Application configuration settings
  - **Controllers/**: API endpoints
  - **Data/**: Database context and configurations
  - **Filters/**: Action filters for request/response handling
  - **Helpers/**: Utility classes and extensions
  - **Hubs/**: SignalR hubs for real-time communication
  - **Middlewares/**: Request/response pipeline components
  - **Models/**: Data models and DTOs
  - **Services/**: Business logic implementation
  - **Validation/**: Request validation rules
  - **Views/**: View templates and email templates

<br>

# Configurations

## Environment Variables

### Frontend
Create a `.env` file in the Frontend directory with:
```bash
API_URL=http://localhost:5000
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
```

### Backend
Create a `.env` file in the Backend directory with:
```bash
DB_CONNECTION=your_connection_string
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
```

<br>

# Setup

## Frontend Setup
1. Navigate to Frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   ng serve
   ```

## Backend Setup
1. Navigate to Backend directory:
   ```bash
   cd Backend
   ```
2. Restore packages:
   ```bash
   dotnet restore
   ```
3. Update database:
   ```bash
   dotnet ef database update
   ```
4. Run the application:
   ```bash
   dotnet watch run
   ```

<br>

# Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br>

# License

This project is licensed under the MIT License - see the LICENSE file for details.

<br>

# Support

For support, please open an issue in the repository or contact the development team. 