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
      host : 'neftimate-db.ce38ewtyfywm.us-west-2.rds.amazonaws.com',
      port : 5432,
      user : 'postgres',
      password : 'neftimator$10',
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
