const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  // uuid = require('uuid'),
  morgan = require('morgan'),
  fs = require('fs'), // import built-in module
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  Movies = Models.Movie,
  Users = Models.User
  cors = require('cors');

const { check, validationResult } = require('express-validator');

// // DEV mode DB
// mongoose.connect('mongodb://localhost:27017/myFlixDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// Mongoose connection to database for CRUD
const DATABASE_URL = process.env.DATABASE_URL || 
"mongodb+srv://patrickholde:JSdBMUkI2CtbM8Mf@movie-info.zujtgza.mongodb.net/MovieInfoDB?retryWrites=true&w=majority";
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// create a write stream(in append mode)
// 'a': Open file for appending. The file is created if it does not exist.
const accessLogStream = fs.createWriteStream('log.txt', {
  flag: 'a',
});

app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// To specify particular URI

let allowedOrigins = [
  'http://localhost:8080',
  'http://testsite.com',
  'http://localhost:1234',
  'https://movie-info-online.herokuapp.com',
  'patrickholderness.github.io'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      // If a specific origin isn't found on the list of allowed origins
      if (allowedOrigins.indexOf(origin) === -1) {
        let message = `The CORS policy for this application doesn't allow access from origin ${origin}`;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

app.options('*', cors());
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'example.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

let auth = require('./auth')(app);

// Require passport module & import passport.js file
const passport = require('passport');
require('./passport');

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
     next();
});

/**
 * GET: Returns welcome message fro '/' request URL
 * @returns Welcome message
 */
app.get('/', (req, res) => {
  res.status(200).send('Welcome to Movie Info!');
});

/**CRUD */
// READ all movies
/**
 * GET: returns a list of ALL movies to the user
 * Request body: Bearer Token
 * @returns array of movie objects
 * @ requires passport
 */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ a single movie by title
/**
 * GET: Returns data (description, genre, director, image URL, whether it's featured or not) about a single movie by title to the user
 * REquest body: Bearer token
 * @param Title (of movie)
 * @returns movie object
 * @requires passport
 */
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ genre description by genre name
/**
 * GET: Returns data about a genre (description) by name/title (e.g., "Fantasy")
 * Request body: Bearer token
 * @param Name (of genre)
 * @returns genre object
 * @requires passport
 */
app.get(
  '/movies/Genre/:Name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
      .then((movie) => {
        res.status(200).json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//READ about director by director name
/**
 * GET: Returns data about a director (bio, birth year) by name
 * Request body: Bearer token
 * @param Name (of director)
 * @returns director object
 * @requires passport
 */
app.get(
  '/movies/director/:Name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
      .then((movie) => {
        res.status(200).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// CREATE a new user
/**
 * POST: Allow new users to register, Username password & Email are required fields!
 * Request body: Bearer token, JSON with user information
 * @returns user object
 */
app.post(
  '/users',
  // Validation logic here for post request
  [
    // check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// READ user by Username
/**
 * GET: Returns data on a single user (user object) by username
 * Request body: Bearer token
 * @param Username
 * @returns user object
 * @requires passport
 */
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// UPDATE username of the user by username
/**
 * PUT: Allow users to update their user info (find by username)
 * Request body: Bearer token, updated user info
 * @param Username
 * @returns user object with updates
 * @requires passport
 */
app.put(
  '/users/:Username',
  // Validation logic here for post request
  [
    // check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      //The third parameter you’ll see is { new: true }. This simply specifies that, in the proceeding callback, you want the document that was just updated to be returned.
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// UPDATE favoriteMovies list by adding a movie to the user by username
/**
 * POST: Allows users to add a movie to their list of favorities
 * Request body: Bearer token
 * @param username
 * @param movieId
 * @returns user object
 * @requires passport
 */
app.put(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $addToSet: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
      // (err, updatedUser) => {
      //   if (err) {
      //     console.error(err);
      //     res.status(500).send('Error: ' + err);
      //   } else {
      //     res.json(updatedUser);
      //   }
      // }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// GET favorite movies list from a user
/**
 * GET: Returns a list of favorite movies from the user
 * Request body: Bearer token
 * @param Username
 * @returns array of favorite movies
 * @requires passport
 */
app.get(
  '/users/:Username/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        if (user) {
          // If a user with the corresponding username was found, return user info
          res.status(200).json(user.FavoriteMovies);
        } else {
          res.status(400).send('Could not find favorite movies for this user');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// DELETE a movie from user favoriteMovies list by username
/**
 * DELETE: Allows users to remove a movie from their list of favorites
 * Request body: Bearer token
 * @param Username
 * @param movieId
 * @returns user object
 * @requires passport
 */
app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// DELETE a user by username
/**
 * DELETE: Allows existing users to deregister
 * Request body: Bearer token
 * @param Username
 * @returns success message
 * @requires passport
 */
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// app.use('/static', express.static('public')); // http://localhost:8080/static/documentation.html
/**
 * Serves static content for the app from the 'public' directory
 */
app.use(express.static('public')); // http://localhost:8080/documentation.html

// 'err' parameter allows you to receive information about whatever unexpected error brought you to the current handler
//Information about the current error would be logged to the terminal using 'err.stack', which is a property of the error parameter for the middleware function.
/**
 * handles errors
 */
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something Broke: ' + err.stack);
});


};