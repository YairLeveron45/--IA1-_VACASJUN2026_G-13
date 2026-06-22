FROM swipl:9.0.4 AS prolog-base
FROM python:3.11-slim-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
        libgmp10 \
        libssl3 \
        libarchive13 \
        libdb5.3 \
        libpcre2-8-0 \
        libyaml-0-2 \
        zlib1g \
        libtinfo6 \
        libgoogle-perftools4 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=prolog-base /usr/lib/swipl /usr/lib/swipl
COPY --from=prolog-base /usr/bin/swipl /usr/bin/swipl

RUN echo "/usr/lib/swipl/lib/x86_64-linux" > /etc/ld.so.conf.d/swipl.conf && ldconfig

ENV SWI_HOME_DIR=/usr/lib/swipl
ENV LD_LIBRARY_PATH=/usr/lib/swipl/lib/x86_64-linux

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
