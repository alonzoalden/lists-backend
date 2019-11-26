//const mongoose = require('mongoose');
const router = require('express').Router();
//const User = mongoose.model('User');
//const Route = mongoose.model('Route');
//const Listing = mongoose.model('Listing');
// const ListingMember = mongoose.model('ListingMember');
const jwtCheck = require('../auth');
const Http = require('../../agent.js');
const keys = require('../../env-config.js');
const axios = require('axios');



const headers = (token) => {
	return { headers: { 'Authorization' : 'Bearer ' + token }};
}

//retreive listings/rides
router.get('/listings', async (req, res, next) => {
	try {
		await Listing.find({})
		.populate('route')
		.populate('members', {
			firstname: 1,
			lastname: 1,
			profile_medium: 1,
			city: 1,
			state: 1,
			_id: 1
		})
		.exec(function (err, listings) {
			if (err) return console.log(err);
			res.send(listings);
		});
	}
	catch(e) {
		console.log(e);
	}
});

//add member to group
router.post('/listing/:listingid/addMember/:userid', jwtCheck, async (req, res) => {
	try {
		await Listing.findById(req.params.listingid)
			.exec(function (err, listing) {
				if (err) return console.log(err);

				User.find({_id: req.params.userid}).exec(function (err, user) {
					listing.members.push(user[0]._id);
					listing.save();
					res.send({});
				})
			});
	}
	catch(err) {
		console.log(err);
		res.json(500, {error: err});

	}
});

//remove group member from listing
router.delete('/listing/:listingid/removeMember/:memberid', jwtCheck, async (req, res) => {
	try {
		Listing.findById(req.params.listingid, function(err, listing) {
			listing.members = listing.members.filter(function(member) {
				return member._id.toString() !== req.params.memberid;
			})
			listing.save();
			res.send(listing.members);
		})
	}
	catch(e) {
		console.log(e);
	}
})

//remove listing
router.delete('/listing/remove/:id', jwtCheck, async (req, res) => {
	try {
		Listing
			.deleteOne({_id: req.params.id}, function(err, listing) {
				res.send(listing);
			})
	}
	catch(e) {
		console.log(e);
	}
})


//post new ride listing
router.post('/listing', jwtCheck, async (req, res) => {
	try {

		let listing = new Listing();
		let route = new Route();

		listing.type = req.body.type;
		listing.title = req.body.title;
		listing.pace = req.body.pace;
		listing.date = req.body.date;
		listing.time = req.body.time;
		listing.info = req.body.info;
		listing.route_id = req.body.route.id;
		listing.creator = req.body.creator;
		listing.creator_id = req.body.creator_id;
		listing.creator_photo = req.body.creator_photo;

		route.id = req.body.route.id;
		route.athlete = req.body.route.athlete;
		route.created_at = req.body.route.created_at;
		route.description = req.body.route.description;
		route.distance = req.body.route.distance;
		route.elevation_gain = req.body.route.elevation_gain;
		route.estimated_moving_time = req.body.route.estimated_moving_time;
		route.map =  req.body.route.map;
		route.name = req.body.route.name;
		route.private = req.body.route.private;
		route.resource_state = req.body.route.resource_state;
		route.starred = req.body.route.starred;
		route.sub_type = req.body.route.sub_type;
		route.timestamp = req.body.route.timestamp;
		route.type = req.body.route.type;
		route.updated_at = req.body.route.updated_at;

		await route.save();
		listing.route = route._id;
		
		await listing.save();

		let listingObject = listing.toObject();
		
		res.json({
			listing: listingObject
		});
	}
	catch(err) {
		console.log(err);
		res.json(500, {error: err});

	}
}).req;


//edit listing
router.put('/listing/:listingid', jwtCheck, async (req, res) => {
	try {

		await Listing.findById(req.params.listingid)
			.exec(async (err, listing) => {
				console.log(listing._id.toString())
				if (err) return console.log(err);
				listing.type = req.body.type;
				listing.title = req.body.title;
				listing.pace = req.body.pace;
				listing.date = req.body.date;
				listing.time = req.body.time;
				listing.info = req.body.info;
				listing.route_id = req.body.route.id;
				

				
				//check if the route exists in the data base before saving it
				let route = new Route();
				route.id = req.body.route.id;
				route.athlete = req.body.route.athlete;
				route.created_at = req.body.route.created_at;
				route.description = req.body.route.description;
				route.distance = req.body.route.distance;
				route.elevation_gain = req.body.route.elevation_gain;
				route.estimated_moving_time = req.body.route.estimated_moving_time;
				route.map =  req.body.route.map;
				route.name = req.body.route.name;
				route.private = req.body.route.private;
				route.resource_state = req.body.route.resource_state;
				route.starred = req.body.route.starred;
				route.sub_type = req.body.route.sub_type;
				route.timestamp = req.body.route.timestamp;
				route.type = req.body.route.type;
				route.updated_at = req.body.route.updated_at;
				await route.save()
				
				listing.route = route._id;
				await listing.save();
				let listingObject = listing.toObject();
		
				res.json({
					listing: listingObject
				});
			});

		
	}
	catch(err) {
		console.log(err);
		res.json(500, {error: err});

	}
}).req;


module.exports = router;