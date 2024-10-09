FROM denoland/deno:alpine-1.40.3 as build
WORKDIR /app
COPY ./ /app
RUN touch .env
RUN deno task build
EXPOSE 8000

RUN echo 'deno task db:migrate latest && deno task web' >> deno_start.sh
RUN chmod +x deno_start.sh

# https://deno.com/blog/aws-lambda-coldstart-benchmarks#optimizing-deno-for-a-serverless-environment
RUN NO_EXTERNAL_CONNECT=1 timeout 3s deno task web || [ $? -eq 124 -o $? -eq 143 ]

CMD ["./app/deno_start.sh"]
