const Http = require('../../agent.js');
const router = require('express').Router();
const db = require('../../db');
const keys = require('../../env-config.js');

router.get('/user/:authAccessToken', async (req, res, next) => {
    try {
        const authResponse = await Http
            .setToken(req.params.authAccessToken)
            .requests.get(`${keys.AUTH0_DOMAIN}/userinfo`);
            
        const dbResponse = await db.query(
            `SELECT * FROM users WHERE auth_email = $1`,
            [authResponse.email]
        )
        if (dbResponse.err) next(err);
        res.send({user: dbResponse.data.rows[0]});
    }
    catch(e) {
        console.log(e);
    }
});

//retreive routes for leads
router.get('/user/routes/:id', async (req, res, next) => {
    try {
        const dbResponse = await db.query(
            `SELECT access_token FROM users WHERE firstname = $1`,
            [req.params.id]
        )

        if (dbResponse.err) next(dbResponse.err);
        const routesResponse = await Http
                .setToken(dbResponse.data.access_token)
                .requests.get(`https://www.strava.com/api/v3/athletes/${req.params.id}/routes`);
            res.json({routes: routesResponse});
        }
    catch(e) {
        console.log(e);
    }
});

//register new user
router.post('/user/register', async (req, res) => {
    try {
        const userInfo = {
            client_id: keys.STRAVA_CLIENT_ID,
            client_secret: keys.STRAVA_CLIENT_SECRET,
            code: req.body.code,
        };

        const stravaResponse = await http
            .requests.post('https://www.strava.com/oauth/token', userInfo)
		
        const authResponse = await http
            .setToken(req.body.accessToken)
            .requests.get(`${keys.AUTH0_DOMAIN}/userinfo`)
        
        //if user is not registered with strava, return auth0 email
        if (!stravaResponse.athlete.email) return res.json({user: {firstname: authResponse.email}});

        const dbResponse = await db.query(
            `INSERT INTO users (access_token, strava_email, auth_email
                strava_id, firstname, lastname, profile, city, state,
                country, sex, created_at, updated_at, profile_medium)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                $12, $13, $14)
            RETURNING *`,
            [
                stravaResponse.access_token,
                stravaResponse.athlete.email,
                authResponse.email,
                stravaResponse.athlete.id,
                stravaResponse.athlete.firstname,
                stravaResponse.athlete.lastname,
                stravaResponse.athlete.profile,
                stravaResponse.athlete.city,
                stravaResponse.athlete.state,
                stravaResponse.athlete.country,
                stravaResponse.athlete.sex,
                stravaResponse.athlete.created_at,
                stravaResponse.athlete.updated_at,
                stravaResponse.athlete.profile_medium
            ])
        if (dbResponse.err) next(err);
        res.send({user: dbResponse.data.rows[0]});
    }
    catch(e) {
        console.log(e);
    }
});


module.exports = router;