const { Pool } = require('pg');

const pool = new Pool({
    host: 'postgres',
    port: 5432,
    user: 'postgres',
    password: 'postgres_password',
    database: 'postgres'
});

pool.connect().catch(((err) => {
    console.log(err);
}))

module.exports = pool; 