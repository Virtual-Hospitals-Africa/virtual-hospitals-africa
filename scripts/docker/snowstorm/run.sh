#! /bin/sh

java -jar snowstorm-10.4.2.jar \
  "--elasticsearch.urls=$ELASTICSEARCH_URL" \
  "--elasticsearch.api-key=$ELASTICSEARCH_API_KEY" \
  "--server.port=${PORT-8080}"
