FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

# install netcat (for waiting)
RUN apt-get update && apt-get install -y netcat-openbsd

CMD ["sh", "-c", "until nc -z postgres 5432; do echo 'Waiting for Postgres...'; sleep 2; done; uvicorn main:app --host 0.0.0.0 --port 8000"]
