const mongoose = require('mongoose');
const Models = require('./models.js');
const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const uuid = require('uuid');

const { check, validationResult } = require ('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Grenre;
const Directors = Models.Director;
const app = express();

//mongoose.connect('mongodb://localhost:27017/myflixdb', { 
  useNewUrlParser: true, 
  //useUnifiedTopology: true 
//});

mongoose.connect('process.env.CONNECTION_URI', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const res = require('express/lib/response');
const req = require('express/lib/request');


app.use(bodyparser.json());
app.use(morgan('common'));
app.use(bodyparser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');

require('./passport');


app.get ('/', (req,res) => {
  res.send('Welcome to my myFlix website');
});

app.get('/test', function(req, res, next){
  res.render('test'); // This should have a view
});

app.get('/movies', passport.authenticate('jwt', { session : false}), (req, res) => {
  Movies.find()
    .then ((movie) =>{
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
  
app.get('/users', passport.authenticate('jwt', { session : false}), function (req,res) {
  Users.find()
  .then(function (users) {
  res.status(201).json(users);
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/users/:Username', (req,res) => { 
   Users.findOne({ Username: req.params.Username})
   .then((user) => {
     res.json(user);
   })
 .catch((err) => {
   console.error(err);
   res.status(500).send('Error: ' + err);
 });
});


 app.get('/movies/:Title', (req,res) => {
   Movies.findOne({ Title: req.params.Title})
   .then((movie) => {
     res.json(movie);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error ' + err);
   });
 });

app.get('/genre/:Name', (req,res) => {
  Movies.findOne({ 'GenreName': req.params.Name })
  .then((movie) => {
    res.json(movie.Genre.Description);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.post('/users/:Username/movies/:MovieID', (req,res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID },
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

app.get('/director/:Name', (req,res) => {
  Movies.findOne({ 'Director.Name': req.params.Name})
  .then((movie) => {
    res.json(movie.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.post('/users', [
  check('Username', 'Username is required').isLength({min:5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required.').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], 
(req,res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array() });
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

app.put('/users/:Username',(req,res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
  {
    Username: req.body.Username, 
    Password: req.body.Password, 
    Email: req.body.Email,
    Birthday: req.body.Birthday
  }
},
{ new: true },
(err, updatedUser) => { 
if(err) {
  console.error(err);
  res.status(500).send('Error: ' + err);
} else {
  res.json(updatedUser);
}
  });
});

app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found ');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// let user = Users.find((user) => {return user.username === req.params.username});

app.delete('/users/:Username/movies/:MovieID', (req,res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } 
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res,json(updatedUser);
    }
  });
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});




