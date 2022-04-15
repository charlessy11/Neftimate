# Neftimate
Zestimate for NFTs

## Repo Setup
1. Clone the repository
1. Make sure you have the most recent version of [node.js](https://nodejs.org/en/) installed to your machine
1. Run `npm install` to install dependencies

## Local Database Setup
1. Ensure postgres is installed on pc
1. Install postgres.app or brew install postgres
1. Make sure your postgres server is running, if not run `pg_ctl -D /usr/local/var/postgres start`
1. Create local database via `createdb neftimate`
1. Use a database client like postico or pgadmin and use info in `knexfile.js` to populate connection info
1. After successfully connecting client, run `npm run migrate` and ensure tables are create correctly

## Scripts
(Ran via `npm run <command>` at project root)

- `build` - Builds typescript into javascript 
- `clean` - Removes compiled javascript in `lib/` folders
- `dev:pull-transaction-data` - Pulls transaction data locally
- `prod:add-collection` - Adds collection data to prod database
- `dev:add-collection` - Adds collection data to local database
- `migrate` - Creates a new migration file

## Project Structure
As this project will require various cloud resources (lambda functions and a database), as well as a frontend, so the idea is to break each piece into its own folder. Upon changes to lambda functions, each will be redeployed at the same time using cloudformation.

- `.circleci`: Holds config for ci/cd pipeline
- `cloud`: Holds all Cloudformation resources
- `ddl`: Holds the database definition
- `events`: Where events that are shared across services live
- `lambda`: Holds each lambda function to be deployed. Each  sub directory is a lambda function.
