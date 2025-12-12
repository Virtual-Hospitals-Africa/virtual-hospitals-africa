# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Virtual Hospitals Africa - a healthcare platform connecting patients with care through WhatsApp chatbots and a web application for health workers.

## Documentation

All coding standards, conventions, and detailed guidance are maintained in `.cursor/rules/shared/`:

- **Fundamentals** (`.cursor/rules/shared/fundamentals/`): Tech stack, project structure, coding standards, terminal commands, testing patterns, database specifics
- **Topic Deep Dives** (`.cursor/rules/shared/topic-deep-dives/`): Forms, migrations, models, routes

Read these files when working in this codebase. They are the source of truth for conventions.

## Quick Reference

```bash
# Development
deno task start                    # Start dev server
deno task local db:rebuild         # Rebuild databases (preferred)

# Testing
deno task test                     # Run all tests
deno task test ./test/path/to.ts   # Run specific test
deno task check                    # Type check

# Database
deno task db:codegen               # Regenerate db.d.ts types

# Environment (always use local!)
deno task local <command>          # Run command against local env
```

## Key Points

- **Runtime**: Deno 2.3.5 (not Node.js)
- **Frontend**: Preact + Signals, Tailwind
- **Database**: PostgreSQL 16 + Kysely
- **Naming**: `snake_case` for data, `camelCase` for functions, `PascalCase` for types
- **Testing**: Database-first (only mock `external-clients/`)
- **Migrations**: OK to modify existing migrations (no live users yet)
