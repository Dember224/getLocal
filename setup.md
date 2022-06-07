#Setup

Welcome to get Local. To setup go ahead and clone the repo located at:
[GetLocal Repo](https://github.com/Dember224/getLocal.git)

## Installing Tools
There are a few tools you should have installed locally:

- Node & npm
- Docker
- Postgres
- Ubuntu
- WSL (if operating a windows machine).
- PG Admin (recommended but not needed). If you don't install PG admin you will have to interact with the database through the command line.

Once those tools are installed navigate to the pathway where this repo lives and run npm install to grab all of our dependancies.

## Creating Local Test Database

Save a .env file in the getLocal directory named Storage. Within that .env file create a variable named `DB_URL_DEV` and set it equal to the localhost url that your database is located in. It should look something like this:

postgres://postgres:postgres@localhost:5432/postgres

In your terminal navigate to the top level directory in the getLocal application. From there run the following command:

`docker compose up`

This should create the docker container that will house the postgres database that you'll be using.

Next run the following from the cli:

`node index --command=GetStorage`

This will create an unpopulated copy of our database.
