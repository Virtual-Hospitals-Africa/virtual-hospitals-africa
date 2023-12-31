FROM denoland/deno:1.39.1 as build
WORKDIR /app
COPY ./ /app
COPY deno*.json ./
RUN deno task build

EXPOSE 8000

ENTRYPOINT ["deno"]
CMD ["run", "--allow-net", "--allow-read", "--unstable", "server.tsx", "-c", "tsconfig.json"]