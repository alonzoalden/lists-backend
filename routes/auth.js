const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

//Auth0 JWT validator
const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://alonzoalden.auth0.com/.well-known/jwks.json"
    }),
    aud: "http://localhost:3000/api/",
    issuer: "https://alonzoalden.auth0.com/",
    algorithms: ['RS256']
});

module.exports = jwtCheck;
