#!/bin/sh
set -euo pipefail

MODEL="${OLLAMA_MODEL:-gemma3:1b}"

echo "Selected model: ${MODEL}"

# 1. Pull the model so that the first request is fast
if [ -n "${MODEL}" ]; then
  echo "Pulling model: ${MODEL}"
  # ollama pull exits with non-zero while the daemon boots, so retry a few times
  tries=0
  until ollama pull "${MODEL}" || [ $tries -ge 5 ]; do
    tries=$((tries + 1))
    echo "Retrying model pull (${tries}/5)..."
    sleep 5
  done
fi

echo "Starting Ollama server..."
exec ollama serve

