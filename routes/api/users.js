//const mongoose = require('mongoose');
const router = require('express').Router();
//const User = mongoose.model('User');
const Auth = require('../auth');
const Http = require('../../agent.js');
const keys = require('../../env-config.js');
const axios = require('axios');

const NodeGeocoder = require('node-geocoder');

const GeocoderOptions = {
	provider: 'google',
	// Optional depending on the providers
	httpAdapter: 'https', // Default
	apiKey: keys.GOOGLE_MAPS_KEY, // for Mapquest, OpenCage, Google Premier
	// formatter: null         // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(GeocoderOptions);
const headers = (token) => {
	return { headers: { 'Authorization' : 'Bearer ' + token }};
}

//retrieve user info
router.get('/user/:authAccessToken', async (req, res, next) => {
	try {
		// const response = await Http
		// 	.setToken(req.params.authAccessToken)
		// 	.requests.get(`${keys.AUTH0_DOMAIN}/userinfo`);
		const response = await axios.get(`https://alonzoalden.auth0.com/userinfo`, headers(req.params.authAccessToken));
		
		await User
			.findOne({ 'auth_email': response.data.email }, (err, person) => {
				if (err) return console.log(err);
				
				return res.json({user: person});
			});
	}
	catch(e) {
		console.log(e);
	}
});

//retreive routes for leads
router.get('/user/routes/:id', Auth, async (req, res, next) => {
	try {
		await User.findById(req.params.id, async (err, person) => {
			if (err) return console.log(err);
			const routesResponse = await Http
				.setToken(person.access_token)
				.requests.get(`https://www.strava.com/api/v3/athletes/${person.strava_id}/routes`);
			res.json({routes: routesResponse});
		});
	}
	catch(e) {
		console.log(e);
	}
});

//return auth email
router.get('/user/authEmail/:authAccessToken', async (req, res, next) => {
	try {
		const user = {
			firstname: '',
			auth_email: ''
		};
		const authResponse = await Http
			.setToken(req.params.authAccessToken)
			.requests.get(`${keys.AUTH0_DOMAIN}/userinfo`)
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
			code: req.body.code
		};

		const stravaResponse = await axios.post('https://www.strava.com/oauth/token', userInfo)
		const authResponse = await axios.get(`https://alonzoalden.auth0.com/userinfo`, headers(req.body.accessToken))
		
		if (!stravaResponse.data.athlete.lastname && !stravaResponse.data.athlete.lastname) {
			const tempUserInfo = {
				firstname: authResponse.data.email || authResponse.data.sub
			};
			return res.json({user: tempUserInfo});
		}

		let user = new User();
		user.access_token = stravaResponse.data.access_token;
		// user.strava_email = stravaResponse.data.athlete.email;
		user.auth_email = authResponse.data.email;
		user.strava_id = stravaResponse.data.athlete.id;
		user.firstname = stravaResponse.data.athlete.firstname;
		user.lastname = stravaResponse.data.athlete.lastname;
		user.profile_medium = stravaResponse.data.athlete.profile_medium;
		user.profile = stravaResponse.data.athlete.profile;
		user.city = stravaResponse.data.athlete.city;
		user.state = stravaResponse.data.athlete.state;
		user.country = stravaResponse.data.athlete.country;
		user.sex = stravaResponse.data.athlete.sex;
		user.created_at = stravaResponse.data.athlete.created_at;
		user.updated_at = stravaResponse.data.athlete.updated_at;
		
		await geocoder.geocode(stravaResponse.data.athlete.city
			+ ", " + stravaResponse.data.athlete.state
			+ ", " + stravaResponse.data.athlete.country, 
			( err, data ) => {
				const locationData = data.raw.results[0].geometry.location;
				user.location_coords = [locationData.lng, locationData.lat];
		});

		await user.save()
		delete user.access_token;

		res.json({user: user.toObject()});
	}
	catch(e) {
		console.log(e);
		res.json(500, {error: e});
	}
});

module.exports = router;