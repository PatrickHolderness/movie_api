const jwtSecret = 'your_jwt_secret'; //this has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
    passport = require('passport');

    require('./passport'); // Your local passport file


    let generateJWTToken = (user) => {
        return jwt.sign(user, jwtSecret, {
            subject: user.Username, // This is the username you're encoding in the JWT
            expiresIn: '7d', //Specifies when the token will expire
            algorithm: 'HS256' //Algorithm used to encode the JWT values

        });
    }


    /* POST LOGIN */
    module.exports = (router) => {
        router.post('/login', (req, res) => {
            passport.authenticate('local', {session:false }, (error, user, info) => {
                if (error || !user) {
                    return res.status(400).json({
                        message: 'Something is not right',
                        user: user
                    });
                }
                req.login(user, {session: false }, (eror) => {
                    if (error) {
                        res.send(error);
                    }
                    let token = generateJWTToken(user.toJSON());
                    return res.json({ user, token });
                    });
                })(req, res); 
            });
    }