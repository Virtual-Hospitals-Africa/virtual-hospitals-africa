# Virtual Hospitals Africa monorepo

Built with ❤️ by the team at <a href="https://morehumaninternet.org">More Human
Internet</a>

### Setup

```bash
> createdb -h localhost -U $your_user -W vha_dev
```

Copy the `.example.env` into `.env` and add the the connection information for
the database you just created.

```
DATABASE_URL=postgres://$your_user:@localhost:5432/vha_dev
```

You'll see other variables that you'll need to override in the `.env` file with
secrets to use external APIs.

# Run locally

```
deno task start
```

This will watch the project directory and restart as necessary.

# Deployment

Currently deployed on Heroku. Reach out to @weiss to get access

# Tech Stack

- Deno
- Fresh
- Preact
- Tailwind
- Typescript
- PostgreSQL
- Whatsapp Cloud API
- Google Calendar API
- Redis
