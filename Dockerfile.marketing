FROM denoland/deno:2.7.5 AS build
WORKDIR /repo

COPY deno.lock ./deno.lock
COPY marketing/deno.json ./marketing/deno.json
COPY marketing/vite.config.ts ./marketing/vite.config.ts
COPY marketing/main.ts ./marketing/main.ts
COPY marketing/routes ./marketing/routes
COPY marketing/islands ./marketing/islands
COPY marketing/static ./marketing/static
COPY marketing/backend ./marketing/backend
COPY marketing/scripts ./marketing/scripts
COPY marketing/blog ./marketing/blog

# Shared code pulled in via relative imports from marketing
COPY components ./components
COPY islands ./islands
COPY util ./util
COPY shared ./shared
COPY external-clients ./external-clients
COPY backend/parseForm.ts ./backend/parseForm.ts

WORKDIR /repo/marketing
RUN deno install --allow-scripts
RUN deno task build

FROM denoland/deno:2.7.5
WORKDIR /app
RUN touch .env

COPY --from=build /repo/marketing/_fresh ./_fresh
COPY --from=build /repo/marketing/deno.json ./deno.json
COPY --from=build /repo/deno.lock ./deno.lock
COPY --from=build /deno-dir /deno-dir

EXPOSE 8000

CMD ["deno", "serve", "-A", "--port", "8000", "_fresh/server.js"]
