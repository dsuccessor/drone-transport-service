#!/bin/sh

set -e

host="$1"
shift
cmd="$@"

echo "⏳ Waiting for database at $host to be ready..."
until nc -z "$host" 5432; do
  sleep 1
done

echo "✅ Database is up! Running command: $cmd"
exec $cmd
