FROM mcr.microsoft.com/mssql/server:2022-latest

USER root
WORKDIR /usr/src/app

COPY init.sql .
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

USER mssql
ENTRYPOINT ["./entrypoint.sh"]