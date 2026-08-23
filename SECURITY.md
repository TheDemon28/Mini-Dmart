# Security Notes

## Authentication and authorization
- JWT tokens are required for protected endpoints.
- Use `Authorization: Bearer <token>` for authenticated requests.
- Role checks are enforced with `authorize("staff", "admin")` and related middleware.

## Environment variables
- Never commit real secrets or production Mongo credentials.
- Store `JWT_SECRET`, database URIs, and deployment credentials in `.env` or secrets manager.

## Password handling
- Passwords are hashed with `bcryptjs` before storage.
- Passwords are not returned from API responses.

## Input validation
- Validate request bodies on the backend before creating users, products, and orders.
- Use backend checks to reject invalid quantities, empty fields, and stock shortages.

## Recommended next hardening measures
- Add rate limiting.
- Add request validation middleware with Joi or Zod.
- Add audit logging for admin actions.
- Restrict CORS to trusted origins in production.
