FROM denoland/deno:2.6.4 AS build
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

EXPOSE 8000

# https://deno.com/blog/aws-lambda-coldstart-benchmarks#optimizing-deno-for-a-serverless-environment
RUN NO_EXTERNAL_CONNECT=1 timeout 3s deno task web || [ $? -eq 124 -o $? -eq 143 ]

CMD ["/app/scripts/web.sh"]
