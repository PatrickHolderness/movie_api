const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    fs = require('fs'),
    path = require('path');
const { rest } = require('lodash');
    mongoose = require('mongoose');
    Models = require('./models.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const Users = Models.User;

//Mongoose connection to database for CRUD
mongoose.connect('mongodb://localhost:27017/MovieInfoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// GET requests
app.get('/', (req, res) => {
    res.send("Welcome to Movie Info!");
});
  
app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});
 
//Display all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  });

  //Display single movie
app.get('/movies/:Title', (req, res) => {
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
    app.get('/movies/genre/:name', (req, res) => {
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
    app.get('/movies/director/:Name', (req, res) => {
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
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
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
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
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
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

//Add movie to favouriteMovies list
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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

//Delete movie from user's favouriteMovies list
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavouriteMovies: req.params.MovieID },
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
app.delete('/users/:Username', (req, res) => {
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});