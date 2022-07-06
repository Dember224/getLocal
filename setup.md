# Setup

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

## Creating A Local Test Database

Save a .env file in the getLocal directory named Storage. Within that .env file create a variable named `DB_URL_PROD` and set it equal to the localhost url that your database is located in. It should look something like this:

postgres://postgres:postgres@localhost:5432/postgres

In your terminal navigate to the top level directory in the getLocal application. From there run the following command:

`docker compose up`

This should create the docker container that will house the postgres database that you'll be using.

Next run the following from the root directory in the cli:

`node index --command=GetStorage`

This will create an unpopulated copy of our database.

##Populating Your Local Database

At the time of this document's composition 2 category of table need to be populated.

1. Election results
2. Finance tables

The Election Results for a state must be populated in order for that state's finance results to be loaded. Fortunately the Finance Load function will call and await the Election Results for the state who's results are being loaded.

###Pulling Election results
Navigate to getLocal's route directory.
Run `node loader --loadType=elections --year=2020 --state=ohio`

Change the election year, and state as needed to load up the various states.

###Pulling Finance results
From getLocal's route directory.
Run `node loader --loadType=finance --year --state=ohio`

You will need the args in the above call **at minimum**
The finance results will require more arguments than the election results. Because the interfaces where each state's finance results are housed are different there are no standard set of args that every state will use.

The arguments that a state might use can be found in the callData object of the loader file in the route directory.

If you're having a trouble finding which args a finance load requires just running the data for a state and referencing the stack trace should help. Or you can reference the code directly in StateSearches. 
