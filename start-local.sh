#!/usr/bin/env bash

set -uo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
frontend_directory="$project_root/frontend"
process_ids=()

cleanup() {
  echo
  echo "Stopping local services..."

  for process_id in "${process_ids[@]}"; do
    kill "$process_id" 2>/dev/null || true
  done
}

trap cleanup INT TERM EXIT

start_dotnet_service() {
  local service_name="$1"
  local service_directory="$2"

  echo "Starting $service_name..."

  (
    cd "$project_root/$service_directory"
    exec dotnet run --launch-profile http
  ) &

  process_ids+=("$!")
}

if [ ! -d "$frontend_directory" ]; then
  echo "Frontend directory was not found: $frontend_directory"
  exit 1
fi

start_dotnet_service "IdentityService" "services/IdentityService"
start_dotnet_service "CandidateService" "services/CandidateService"
start_dotnet_service "CompanyService" "services/CompanyService"
start_dotnet_service "ApplicationService" "services/ApplicationService"
start_dotnet_service "QuizService" "services/QuizService"
start_dotnet_service "MatchingService" "services/MatchingService"
start_dotnet_service "NotificationService" "services/NotificationService"
start_dotnet_service "ApiGateway" "gateway/ApiGateway"

echo "Starting frontend..."

(
  cd "$frontend_directory"
  exec npm run dev
) &

process_ids+=("$!")

echo
echo "All local processes were started."
echo "Gateway:  http://localhost:5000/health"
echo "Frontend: check the Vite URL printed below."
echo "Press Ctrl+C to stop all processes started by this script."
echo

wait
