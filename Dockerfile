FROM denoland/deno:alpine-2.3.5 AS build
WORKDIR /app

COPY deno.json deno.lock ./

RUN deno install --frozen --allow-scripts

# Copy all application files (node_modules excluded via .dockerignore)
COPY ./ ./

# # Build the application
RUN deno task build
EXPOSE 8000

# https://deno.com/blog/aws-lambda-coldstart-benchmarks#optimizing-deno-for-a-serverless-environment
RUN NO_EXTERNAL_CONNECT=1 timeout 3s deno task web || [ $? -eq 124 -o $? -eq 143 ]

CMD ["/app/scripts/web.sh"]
