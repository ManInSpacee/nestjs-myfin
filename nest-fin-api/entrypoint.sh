#!/bin/sh

set -e

until npx prisma migrate deploy; do
  echo "База недоступна, повтор через 2с..."
  sleep 2
done

exec "$@"