require('dotenv').config();

const {
  PROD_DB_URL,
  PROD_DB_PASSWORD
} = process.env

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : require("os").userInfo().username,
      password : '',
      database : 'neftimate'
    },
    migrations: {
      directory: './store/migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: './store/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host : PROD_DB_URL,
      port : 5432,
      user : 'postgres',
      password : PROD_DB_PASSWORD,
      database : 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './store/migrations',
    },
    seeds: {
      directory: './store/seeds'
    }
  }

};
