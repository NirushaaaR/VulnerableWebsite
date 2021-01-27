FROM python:3.8-slim

# Not allow python to buffer output in docker (print directly)
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /requirements.txt

RUN pip install -r /requirements.txt

COPY ./app /app

COPY ./flag.txt /flag.txt

WORKDIR /app

CMD ["python", "main.py"]