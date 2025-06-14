# My Health App

A comprehensive health management application built with Angular frontend and .NET Core backend.

## Project Structure

The project is divided into two main parts:

### Frontend (Angular)
Located in the `Frontend` directory, this is a modern web application built with:
- Angular (Latest version)
- TypeScript
- Angular Material (for UI components)
- RxJS (for reactive programming)

### Backend (.NET Core)
Located in the `Backend` directory, this is a robust API built with:
- .NET Core
- Entity Framework Core
- SQL Server
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (for Frontend)
- .NET Core SDK (for Backend)
- SQL Server
- Angular CLI

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   ng serve
   ```
   The application will be available at `http://localhost:4200`

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```
2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```
3. Update the database:
   ```bash
   dotnet ef database update
   ```
4. Run the application:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5000`

## Features

### Frontend Features
- Modern, responsive user interface
- Real-time data updates
- User authentication and authorization
- Interactive dashboards
- Form validation
- Error handling

### Backend Features
- RESTful API endpoints
- Database integration
- Authentication and authorization
- Logging system
- API documentation
- Unit testing

## Development

### Frontend Development
- The source code is located in `Frontend/src`
- Main components and services are organized in the `app` directory
- Styling is handled through SCSS
- Environment configurations are in `environments` directory

### Backend Development
- Source code is in `Backend/Source`
- Database migrations are in `Backend/Migrations`
- API controllers and models are organized in respective directories
- Configuration files are in the root of the Backend directory

## Testing
- Frontend: Run `ng test` in the Frontend directory
- Backend: Run `dotnet test` in the Backend directory

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, please open an issue in the repository or contact the development team.
