const {Pool} = require('pg');
const { connectionString } = require('pg/lib/defaults');
require('dotenv').config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(client =>{
    console.log('Connected to PostgreSQL');
    client.release();
  })
  .catch( err =>{
    console.error('Connexion error', err);
  })

module.exports = pool;