# CareerConnect — Microservices Application

This project represents the transition of the CareerConnect monolith into a microservices architecture. The frontend communicates through one API Gateway, while each microservice owns a separate business domain and, where required, its own PostgreSQL database.

## Technology Stack

- .NET 8 / ASP.NET Core Web API
- Entity Framework Core and PostgreSQL
- JWT authentication
- SignalR for real-time notifications
- YARP Reverse Proxy as the API Gateway
- React, TypeScript, Vite, and Tailwind CSS

## Microservices

| Service | Responsibility | HTTP Port |
| --- | --- | ---: |
| IdentityService | Registration, sign-in, user accounts, and JWT | 5018 |
| CandidateService | Candidate profile, education, and work experience | 5193 |
| CompanyService | Company profile and job listings | 5063 |
| ApplicationService | Job applications and application statuses | 5158 |
| QuizService | Company questions and candidate answers | 5015 |
| MatchingService | Skill matching between candidates and job listings | 5286 |
| NotificationService | Notifications and SignalR hub | 5270 |
| ApiGateway | Single frontend entry point | 5000 |

`MatchingService` is stateless and has no database. Every other service that persists data has a separate database. Services use HTTP calls when they need data from another domain.

## Gateway Routes

The frontend sends requests only to the gateway at `http://localhost:5000/api`.

- `/api/auth` and `/api/users` → IdentityService
- `/api/candidate-profile` → CandidateService
- `/api/company-profile` and `/api/jobs` → CompanyService
- `/api/job-applications` → ApplicationService
- `/api/quiz` → QuizService
- `/api/matching` → MatchingService
- `/api/notifications` and `/hubs/realtime` → NotificationService

## Prerequisites

- .NET SDK 8
- Node.js 20 or newer
- PostgreSQL

## Database Setup

Create a separate PostgreSQL database for each stateful service:

```text
careerconnect_identity
careerconnect_candidate
careerconnect_company
careerconnect_application
careerconnect_quiz
careerconnect_notification
```

Create an `appsettings.Development.json` file in each service with the local connection string, JWT settings, and internal service addresses where needed. This file is ignored by Git and must not be committed.

Example connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=careerconnect_identity;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

Apply migrations for services with a database:

```bash
cd services/IdentityService && dotnet ef database update
cd ../CandidateService && dotnet ef database update
cd ../CompanyService && dotnet ef database update
cd ../ApplicationService && dotnet ef database update
cd ../QuizService && dotnet ef database update
cd ../NotificationService && dotnet ef database update
```

## Docker Compose

Docker Compose provides a self-contained local environment for demonstrating the microservices architecture. It starts PostgreSQL, the gateway, frontend, and every microservice in a separate container.

Install Docker Desktop, then create a local Docker environment file:

```bash
cp .env.docker.example .env.docker
```

Replace the placeholder secrets in `.env.docker`, then start the system:

```bash
docker compose --env-file .env.docker up --build
```

The `.env.docker` file must contain the following variables. Use local values; do not commit this file.

```env
POSTGRES_USER=careerconnect
POSTGRES_PASSWORD=YOUR_LOCAL_DATABASE_PASSWORD
JWT_KEY=YOUR_JWT_SECRET_WITH_AT_LEAST_32_CHARACTERS
JWT_ISSUER=CareerConnect
JWT_AUDIENCE=CareerConnect
INTERNAL_API_KEY=YOUR_LOCAL_INTERNAL_API_KEY
SEED_ADMIN_EMAIL=admin@careerconnect.local
SEED_ADMIN_PASSWORD=YOUR_LOCAL_ADMIN_PASSWORD
```

When Docker starts `IdentityService` for the first time, it creates the
administrator from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` if a user with
that email does not already exist. The password is hashed before it is stored.
Use these same values to sign in as the administrator. On later restarts, the
existing administrator is kept unchanged.

The frontend is available at `http://localhost:5173` and the Docker gateway at `http://localhost:5001/health`.

On its first start, each stateful service applies its own EF Core migrations to its own database. Docker data is retained in the `postgres-data` volume.

Useful demonstration commands:

```bash
# Stop and start only the quiz module.
docker compose --env-file .env.docker stop quiz-service
docker compose --env-file .env.docker start quiz-service

# View logs for one service.
docker compose --env-file .env.docker logs -f quiz-service

# Stop all containers while preserving database data.
docker compose --env-file .env.docker down
```

The Compose configuration intentionally runs two named `MatchingService` instances. The gateway uses YARP round-robin load balancing between them, illustrating horizontal scaling of a stateless and potentially CPU-intensive module without duplicating the other services.

## Running All Microservices Locally

From the project root, run:

```bash
cd /Users/torlakovic/Desktop/CareerConnectMicroservices
./start-local.sh
```

The script starts every microservice, the gateway, and the microservices frontend. Press `Ctrl+C` in the same terminal to stop all processes started by the script.

To run one service manually:

```bash
cd services/IdentityService
dotnet run --launch-profile http
```

Swagger for an individual service is available on its port, for example:

```text
http://localhost:5018/swagger
```

Gateway health endpoint:

```text
http://localhost:5000/health
```

## Frontend

The microservices frontend must use the API Gateway:

```env
VITE_API_URL=http://localhost:5000/api
```

Run it manually with:

```bash
cd frontend
npm install
npm run dev
```

## Build Verification

```bash
dotnet build CareerConnect.Microservices.sln

cd frontend
npm run build
```

## Project Structure

```text
CareerConnectMicroservices/
├── services/                 # Independent microservices
├── gateway/ApiGateway/       # YARP API Gateway
├── frontend/                 # React frontend for the microservices version
├── docker/                   # Docker and PostgreSQL initialization files
├── docker-compose.yml        # Container orchestration and matching replicas
├── start-local.sh            # Local system startup script
└── CareerConnect.Microservices.sln
```
