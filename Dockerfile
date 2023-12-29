FROM denoland/deno:1.39.1
WORKDIR /app

EXPOSE 8000

COPY deno.json .
COPY deno.lock .
COPY dev.ts .
COPY fresh.config.ts .
COPY fresh.gen.ts .
COPY main.ts .
COPY tailwind.config.ts .
COPY types.ts .

COPY chatbot ./chatbot
COPY components ./components
COPY db ./db
COPY external-clients ./external-clients
COPY islands ./islands
COPY routes ./routes
COPY scheduling ./scheduling
COPY static ./static
COPY util ./util

RUN deno task build

CMD ["task", "web"]
