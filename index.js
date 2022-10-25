const express = require('express'),
      morgan = require('morgan'),
      path = require('path'),
      bodyParser = require('body-parser'),
      uuid = require('uuid');
      fs = require('fs');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;


const dotenv = require('dotenv');
      dotenv.config()
  
      // Mongoose connection to database for CRUD
//mongoose.connect('mongodb://localhost:27017/MovieInfoDB', {
//useNewUrlParser: true,
//useUnifiedTopology: true,
// });

// Mongoose connection to database for CRUD
const DATABASE_URL = process.env.DATABASE_URL || 
"mongodb+srv://patrickholde:JSdBMUkI2CtbM8Mf@movie-info.zujtgza.mongodb.net/MovieInfoDB?retryWrites=true&w=majority";
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
//CORS - place before route middleware
const cors = require('cors');

let allowedOrigins = ['http://localhost:8080', 'http://localhost:4200','http://movie-info-online.herokuapp.com'];

app.use(cors({
  origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
          let message = 'The CORS policy for this application doesn\’t allow access from origin ' + origin;
          return callback(new Error(message), false);
      }
      return callback(null, true);
  }
}));

app.options('*', cors());
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'example.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
}

//Validation and authentication
const { check, validationResult } = require ('express-validator');
const { rest, isLength, isEmpty } = require('lodash');
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport.js');




app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
     next();
});

// GET requests
app.get('/', (req, res) => {
    res.send("Welcome to Movie Info!");
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//Display all movies
app.get("/movies", passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then(function (movies) {
      res.status(201).json(movies);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

  //Display single movie
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
    });

    //Display Genre
    app.get('/movies/genre/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
        Movies.find({ 'Genre.Name' : req.params.name })
          .then((genre) => {
            res.status(201).json(genre)
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
          });
      });


    //Display Director ddata
    app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
        Movies.find({ 'Director.Name': req.params.Name })
          .then((director) => {
            res.json(director);
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
          });
        });


//Get all users
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users',

[
  check ('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()

], (req, res) => {

  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });

  }
  let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
[   // Validation checks
check('Username', 'Username must be at least 5 characters').isLength({ min: 5 }),
check('Username', 'Username must contain only alphanumeric characters').isAlphanumeric(),
check('Password', 'Password must be at least 8 characters').isLength({ min: 8 }),
check('Email', 'Email does not appear to be valid').isEmail()
],
(req, res) => {
// First check for validation errors
let errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
}
let hashedPassword = Users.hashPassword(req.body.Password);
Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
    }
}, { new: true })
    .then(user => { res.status(201).json(user) })
    .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Add movie to favoriteMovies list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $push: { FavouriteMovies: req.params.MovieID }
     },
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

//Delete movie from user's favoriteMovies list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
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
});

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//Read
app.get('/', (req, res) => {
    res.send("Welcome to myFlix Movie App!");
  });


//serving static files
app.use(express.static('public'));

//Morgan request logger
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined',{stream: accessLogStream}));

//error-handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


// listen for requests
const port = process.env.PORT || 1234;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
