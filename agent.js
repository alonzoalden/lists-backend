const superagentPromise = require('superagent-promise');
const _superagent = require('superagent');

const superagent = superagentPromise(_superagent, global.Promise);

const encode = encodeURIComponent;
const responseBody = res => res.body;

let token = null;
const tokenPlugin = req => {
	if (token) {
		req.set('Authorization', `Bearer ${token}`);
	}
}
const tokenSetup = token => tokenPlugin;

const requests = {
	del: url =>
		superagent.del(`${url}`).use(tokenPlugin).then(responseBody),
	get: (url) => 
		superagent.get(`${url}`).use(tokenPlugin).then(responseBody),
	put: (url, body) =>
		superagent.put(`${url}`, body).use(tokenPlugin).then(responseBody),
	post: (url, body) =>
		superagent.post(`${url}`, body).use(tokenPlugin).then(responseBody)
};

module.exports = {
	requests,
	setToken: _token => {
		{ token = _token; }
		return { requests: requests };
	}
}