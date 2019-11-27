const Http = require('../../agent.js');
const router = require('express').Router();
const db = require('../../db');
const keys = require('../../env-config.js');

// router.get('/user/:authAccessToken', async (req, res, next) => {
//     try {
//         const authResponse = await Http
//             .setToken(req.params.authAccessToken)
//             .requests.get(`${keys.AUTH0_DOMAIN}/userinfo`);
            
//         const dbResponse = await db.query(
//             `SELECT * FROM users WHERE auth_email = $1`,
//             [authResponse.email]
//         )
//         if (dbResponse.err) next(err);
//         res.send({user: dbResponse.data.rows[0]});
//     }
//     catch(e) {
//         console.log(e);
//     }
// });

// //retreive routes for leads
router.get('lists', async (req, res, next) => {
    try {
        const dbResponse = await db.query(
            `SELECT * FROM lists`
        )
        if (dbResponse.err) next(dbResponse.err);
            res.json(dbResponse);
        }
    catch(e) {
        console.log(e);
    }
});

//add new list
router.post('/lists', async (req, res, next) => {
    try {
        const dbResponse = await db.query(
            `INSERT INTO lists (Title, Category, Description, ImageURL, Created_At, Updated_At)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                req.body.Title,
                req.body.Category,
                req.body.Description,
                req.body.ImageURL,
                req.body.Created_At,
                req.body.Updated_At
            ])
        if (dbResponse.err) next(err);
        res.status(200).send({})
        //res.send(dbResponse.data.fields);
    }
    catch(e) {
        console.log(e);
    }
});

module.exports = router;