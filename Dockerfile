FROM denoland/deno:2.8.0 AS build
WORKDIR /app

# Workaround for deno loader 0.3.10 failed reading lockfile during vite build
# https://discord.com/channels/684898665143206084/1455023326555803821
COPY deno.lock ./
COPY deno.json ./

# Run install
RUN deno install --allow-scripts

# Copy all application files (node_modules & deno.lock are excluded via .dockerignore)
COPY ./ ./

# Build the application
RUN deno task build


FROM denoland/deno:2.8.0
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates postgresql-client && rm -rf /var/lib/apt/lists/*
RUN touch .env

# Copy build output (static assets + compiled server)
COPY --from=build /app/_fresh ./_fresh

# Copy db files needed at runtime (models, db.ts, helpers.ts)
COPY --from=build /app/db ./db

# Copy deno module cache to avoid re-downloading at startup
COPY --from=build /deno-dir /deno-dir

# Copy deno config (needed for task resolution) and startup scripts
COPY --from=build /app/deno.json ./deno.json
COPY --from=build /app/deno.lock ./deno.lock
COPY --from=build /app/scripts/web.sh ./scripts/web.sh

EXPOSE 8000

# https://deno.com/blog/aws-lambda-coldstart-benchmarks#optimizing-deno-for-a-serverless-environment
RUN NO_EXTERNAL_CONNECT=1 timeout 3s deno task web || [ $? -eq 124 -o $? -eq 143 ]

CMD ["/app/scripts/web.sh"]
