FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpoppler-cpp-dev pkg-config poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /scripts
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download de_core_news_sm || python -c "import spacy; spacy.blank('de')"

COPY . .

CMD ["uvicorn", "worker:app", "--host", "0.0.0.0", "--port", "8000"]
