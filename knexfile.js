require('dotenv').config();


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

  staging: {
    client: 'pg',
    connection: process.env.STAGING_DB_URL,
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
  },

  production: {
    client: 'pg',
    connection: process.env.PROD_DB_URL,
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
