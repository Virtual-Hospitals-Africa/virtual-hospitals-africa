FROM denoland/deno:alpine-1.40.3 as build
WORKDIR /app
COPY ./ /app
RUN touch .env
RUN deno task build
EXPOSE 8000

RUN echo 'deno task db:migrate:latest && deno task web' >> deno_start.sh
RUN chmod +x deno_start.sh
CMD ["/app/deno_start.sh"]

# ENTRYPOINT ["deno"]
# CMD ["run", "--allow-all", "main.ts", ]