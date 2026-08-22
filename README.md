# E-Commerce Website Using Microservices Architecture

Team: A K M Ferdous Reza Habib (220041138), Shadab Bin Habib (220041201), Isfak Iqbal Chowdhury (220041213)

Trimmed-scope e-commerce project: one Spring Boot monolith (users/auth, products, cart, orders, payment mock, inventory, admin) plus one standalone Reviews & Ratings microservice, wired together via Docker Compose. See `project_plan.md` for the full architecture, scope rationale, and build plan.

## Structure
- `/monolith` — Spring Boot app (port 8080)
- `/reviews-service` — Spring Boot app (port 8082)
- `/frontend` — React (Vite) app, run locally with `npm run dev`, not containerized
- `docker-compose.yml` — runs the 4 backend containers (monolith, reviews-service, monolith-db, reviews-db)

## Running the backend
```
docker compose up --build
```
Monolith Swagger UI: http://localhost:8080/swagger-ui.html
Reviews-service Swagger UI: http://localhost:8082/swagger-ui.html

Copy `.env.example` to `.env` and adjust `DB_PASSWORD` / `JWT_SECRET` before running in any shared/non-local environment.

## Running the frontend
```
cd frontend
npm install
npm run dev
```
Opens at http://localhost:5173. Copy `frontend/.env.example` to `frontend/.env` if the backend isn't on the default ports (`8081`/`8082` locally, since 8080/3306 are commonly already in use on dev machines — see `docker-compose.yml` port mappings).
