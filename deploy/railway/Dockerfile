FROM ollama/ollama:latest

ENV OLLAMA_MODEL="gemma3:1b"

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 11434

ENTRYPOINT ["/entrypoint.sh"]

