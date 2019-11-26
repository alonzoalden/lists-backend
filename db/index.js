const { Pool } = require('pg');
const keys = require('../env-config.js');
// const connectionString = process.env.DATABASE_URL || keys.pg.local_postgres;
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
});

module.exports = {
    query: (text, params, callback) => {
        const start = Date.now();
        return new Promise((resolve) => {
            pool.query(text, params, (err, res) => {
                const duration = Date.now() - start;
                console.log('executed query', { text, duration, rows: res.rowCount });
                resolve({
                    err: err,
                    data: res
                });
            });

        })
    }
};
