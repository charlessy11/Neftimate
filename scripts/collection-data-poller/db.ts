const knex = require('knex');

const knexfile = require('../../../knexfile.js');


const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

const db = knex(configOptions);

export default db
