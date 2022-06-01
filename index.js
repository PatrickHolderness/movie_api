const express = require('express');
      morgan = require('morgan');
      fs=require('fs'),
      path=require('path');

const app = express();

let Movies = [
    {
        title: 'La Grande Bouffe',
        director: 'Marco Ferreri'
    },
    {
        title: 'Le Voyou',
        director: 'Claude Lelouch'
    },
    {
        title: 'Blue Thunder',
        director: 'John Badham'
    },
    {
        title: 'Les Choses de la vie',
        director: 'Claude Sautet'
    },
    {
        title: 'Cobra',
        director: 'George P. Cosmatos'
    },
    {
        title: 'The Conformist',
        director: 'Bernardo Bertolucci'
    },
    {
        title: 'Rendezvous in Paris',
        director: 'Eric Rohmer'
    },
    {
        title: 'The Godfather',
        director: 'Martin Scorcese'
    },
    {
        title: 'Le Prix du Danger',
        director: 'Yves Boisset'
    },
    {
        title: 'La Guerre est finie',
        director: 'Alan Resnais'
    }
];

// GET requests
app.get('/', (req, res) => {
    res.send("Welcome to Movie Info!");
});
  
app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});
  
app.get('/movies', (req, res) => {
    res.json(Movies);
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