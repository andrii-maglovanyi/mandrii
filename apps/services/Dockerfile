
FROM python:3.13-slim

RUN pip install uv
WORKDIR /usr/local/app

COPY pyproject.toml uv.lock* ./
RUN uv sync --no-cache-dir

COPY src ./src

RUN useradd -m app && chown -R app:app /usr/local/app
USER app

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
