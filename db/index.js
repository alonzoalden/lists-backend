const { Pool } = require('pg');
const keys = require('../env-config.js');
const connectionString = keys.dbConnectionString;
// const connectionString = process.env.DATABASE_URL || keys.pg.local_postgres;


const pool = new Pool({
    connectionString: 'postgres://enduser:easyone12@localhost:5432/lists',
});
// {
//   user: 'dbuser',
//   host: 'database.server.com',
//   database: 'mydb',
//   password: 'secretpassword',
//   port: 3211,
// }
module.exports = {
    query: (text, params, callback) => {
        const start = Date.now();
        return new Promise((resolve) => {
            pool.query(text, params, (err, res) => {
                if (res) {
                    const duration = Date.now() - start;
                    // console.log('executed query', { text, duration, rows: res.rowCount });
                    resolve({
                        err: err,
                        data: res
                    });
                }
            });

        })
    }
};
