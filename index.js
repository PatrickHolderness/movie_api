const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    fs = require('fs'),
    path = require('path');
    mongoose = require('mongoose');
    Models = require('./models.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/MovieInfoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


let users = [
    {

    "id": "1",
    "name": "Patrick",
    "favouriteMovies": ['BLue Thunder']
    },

{
    "id": "2",
    "name": "Henry",
    "favouriteMovies": ['La Grande Bouffe']
}
]


let movies = [
    {
        "Title": 'La Grande Bouffe',
        "Description": "La Grande Bouffe (English: The Grand Bouffe and Blow-Out) is a 1973 satirical film. The film centres on a group of friends who plan to eat themselves to death. It satirises consumerism and the decadence of the bourgeoisie and was therefore controversial upon its release. It has become a cult film.",
        "Director": {

         "name": "Marco Ferreri",
         "Birth Year": "1928",
         "Biography": "Marco Ferreri (11 May 1928 - 19 May 1997) was an Italian film director, screenwriter and actor, who began his career in the 1950s directing three films in Spain, followed by 24 Italian films before his death in 1997. He is considered one of the greatest European cinematic provocateurs of his time and had a constant presence in prestigious festival circuit - including eight films in competition in Cannes Film Festival and a Golden Bear win in 1991 Berlin Film Festival. Three of his films are among 100 films selected for preservation for significant contribution to Italian cinema."
        },
        "Genre": {
            "Name":"Satire"
        }
    },

    {
        "Title": 'Le Voyou',
        "Description": "Le Voyou, also known as The Crook, is a highly stylized French action film which follows Simon the Swiss during his largest heist.",
        "Director": {

         "name": "Claude Lelouch",
         "Birth year": "1937",
         "Biography": "Claude Barruck Joseph Lelouch, born 30 October 1937, is a French film director, writer, cinematographer, actor and producer. Lelouch grew up in an Algerian Jewish Family. He emerged as a prominent director in the 1960s."
    },
        "Genre": {
        "name":"Action"
    }
    },
    {
        "Title": 'Blue Thunder',
        "Description": "The cop test pilot for an experimental police helicopter learns the sinister implications of the new vehicle.",
        "Director": {
 
         "name": "John Badham",
         "Birth year": "1939",
         "Biography": "John MacDonald Badham (born August 25, 1939) is an English-born American television and film director, best known for his films Saturday Night Fever (1977), Dracula (1979), Blue Thunder (1983), WarGames (1983), Short Circuit (1986), and Stakeout (1987)."
    },
        "Genre": {
        "name":"Action"
    }
    },

    {
        "Title": 'Les Choses de la vie',
        "Description": "A highway engineer is involved in a car crash, after which, near death, he remembers his life leading up to the accident.",
        "Director": {
            "name": "Claude Sautet",
            "Birth year": "1924",
            "Biography": "Claude Sautet (23 February 1924 - 22 July 2000) was a French film director and screenwriter. He was a chronicler of post-war French society. He made a total of five films with his favorite actress Romy Schneider."
    },
        "Genre": {
        "name":"Drama"
    }
    },

    {
       "Title": 'Cobra',
       "Description": "A tough-on-crime street cop must protect the only surviving witness to a strange murderous cult with far-reaching plans.",
        "Director": {
            "name": "George P. Cosmatos",
            "Birth year": "1941",
            "Biography": "George Pan Cosmatos (4 January 1941 - 19 April 2005) was a Greek-Italian film director and screenwriter. Following early success in his home country with drama films such as Massacre in Rome with Richard Burton (based on the real-life Ardeatine massacre), Cosmatos retooled his career towards mainstream 'blockbuster' action and adventure films, including The Cassandra Crossing and Escape to Athena, both of which were British-Italian co-productions.",
    },
        "Genre": {
            "name":"Action"
        }
    },

    {
        "Title": 'The Conformist',
        "Description": "A weak-willed Italian man becomes a fascist flunky who goes abroad to arrange the assassination of his old teacher, now a political dissident.",
        "Director": {
            "name": "Bernardo Bertolucci",
            "Birth year": "1941",
            "Biography": "Bernardo Bertolucci (16 March 1941 – 26 November 2018) was an Italian film director and screenwriter with a career that spanned 50 years. Considered one of the great filmmakers of the Italian cinema, Bertolucci's work achieved international acclaim."
    },
        "Genre": {
            "name":"Drama"
        }
    },

    {
        "Title": 'Rendezvous in Paris',
        "Description": "Three stories of love and coincidence around the theme of dates in Paris.",
        "Director": {
            "Name": "Eric Rohmer",
            "Birth year": "1920",
            "Biography": "Jean Marie Maurice Schérer or Maurice Henri Joseph Schérer, known as Éric Rohmer, was a French film director, film critic, journalist, novelist, screenwriter, and teacher. Rohmer was the last of the post-World War II French New Wave directors to become established."
        },
            "Genre": {
                "name":"Romance"
            }
    },

    {
        "Title": "The Godfather",
        "Description": "The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son.",
        "Director": {
            "Name": "Francis Ford Coppola",
            "Birth year": "1939",
            "Bio": "Francis Ford Coppola is an American film director, producer, and screenwriter. He is considered one of the major figures of the New Hollywood filmmaking movement of the 1960s and 1970s, and is the recipient of five Academy Awards, six Golden Globe Awards, two Palmes d'Or, and a British Academy Film Award."
        },
        "Genre": {
            "Name": "Crime",
        }
    },

    {
        "Title": "Le Prix du Danger",
        "Description": "In a futuristic society, contestants pit their survival skills against each other in a fight to the death for cash prizes, and the contest is aired live on television.",
        "Director": {
            "Name": "Yves Boisset",
            "Birth year": "1939",
            "Bio": "Yves Boisset is a French film director and scriptwriter. Boisset began his career as an assistant director. After working with such directors as Hossein, Ciampi, Melville and Clement, he began directing short films until the late 1960s when he made his feature film debut."
        },
    "Genre": {
       "Name": "Thriller",
    }
    },

    {
        "Title": "La Guerre est finie",
        "Description": "A middle-aged political activist tries to dissuade his young followers from taking radical action.",
        "Director": {
            "Name": "Alan Resnais",
            "Birth year": "1922",
            "Bio": "Alain Resnais was a French film director and screenwriter whose career extended over more than six decades. After training as a film editor in the mid-1940s, he went on to direct a number of short films which included Night and Fog, an influential documentary about the Nazi concentration camps."
        },
        "Genre": {
            "Name": "Drama",
    }
    },
];

// GET requests
app.get('/', (req, res) => {
    res.send("Welcome to Movie Info!");
});
  
app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});
 
//Display all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//Display single movie
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title);
  
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send("Sorry, no such movie.");
    }
  });

    //Display Genre
    app.get('/movies/genre/:genreName', (req, res) => {
        const { genreName } = req.params;
        const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

        if (genre) {
            res.status(200).json(genre);
        }
        else {
            res.status(400).send("No such genre");

        }
        
    });
    

    //Display Director ddata
    app.get('/movies/directors/:directorName', (req, res) => {
        const { directorName } = req.params;
        const directors = movies.find(movie => movie.Director.name == directorName).Director;

        if (directors) {
            res.status(200).json(directors);
        }
        else {
            res.status(400).send("No such director");

        }
   
    });

//Create new user
app.post('/users', (req, res) => {
    const newUser = req.body;
    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } 
    else  {
        res.status(400).send("Name required");
    }
});

//update user
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);
    if (user) {
        user.name = updatedUser;
        res.status(200).json(user);
    } else {
        res.status(400).send("No such user");
    }
});

//Add movie to favouriteMovies list
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);
    if (user) {
        user.favouriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send("No such user");
    }
});

//Delete movie from user's favouriteMovies list
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);
    if (user) {
        user.favouriteMovies = user.favouriteMovies.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send("No such user");
    }
});

//Delete user
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);
    if (user) {
        users = users.filter(user => user.id !== id);
        res.status(200).send(`User account ${id} has been deleted`);
    } else {
        res.status(400).send("No such user");
    }
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