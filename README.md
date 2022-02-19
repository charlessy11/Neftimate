# Neftimate
Zestimate for NFTs

## Repo Setup
1. Clone the repository
2. Make sure you have the most recent version of [node.js](https://nodejs.org/en/) installed to your machine
3. Run `npm install` to install dependencies


## Scripts
(Ran via `npm run <command>` at project root)

- `build` - Builds typescript into javascript 
- `clean` - Removes compiled javascript in `lib/` folders


## Project Structure
As this project will require various cloud resources (lambda functions and a database), as well as a frontend, so the idea is to break each piece into its own folder. Upon changes to lambda functions, each will be redeployed at the same time using cloudformation.

- `.circleci`: Holds config for ci/cd pipeline
- `cloud`: Holds all Cloudformation resources
- `ddl`: Holds the database definition
- `events`: Where events that are shared across services live
- `lambda`: Holds each lambda function to be deployed. Each  sub directory is a lambda function.
