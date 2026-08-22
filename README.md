# E-Commerce Website Using Microservices Architecture

Team: A K M Ferdous Reza Habib (220041138), Shadab Bin Habib (220041201), Isfak Iqbal Chowdhury (220041213)

Trimmed-scope e-commerce project: one Spring Boot monolith (users/auth, products, cart, orders, payment mock, inventory, admin) plus one standalone Reviews & Ratings microservice, wired together via Docker Compose. See `project_plan.md` for the full architecture, scope rationale, and build plan.

## Structure
- `/monolith` — Spring Boot app (port 8080)
- `/reviews-service` — Spring Boot app (port 8082)
- `/frontend` — React app (not yet scaffolded)
- `docker-compose.yml` — runs all 4 containers (monolith, reviews-service, monolith-db, reviews-db)

## Running locally
```
docker compose up --build
```
Monolith Swagger UI: http://localhost:8080/swagger-ui.html
Reviews-service Swagger UI: http://localhost:8082/swagger-ui.html

Copy `.env.example` to `.env` and adjust `DB_PASSWORD` / `JWT_SECRET` before running in any shared/non-local environment.
