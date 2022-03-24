const express = require('express'),
      morgan =require('morgan'),
      bodyparser = require('body-parser'),
      uuid = require('uuid');

const app = express();

app.use(bodyparser.json());
app.use(morgan('common'));

let users =  [
    {
      id: '1',
      username: 'Simon',
      email: 'simonjohnloik@gmail.com',
      password: 'Cola13Ginger!!',
      birthday: '04/02/1996',
      favorites: []
    }
  ]
  
  let movies = [
    {
      title: 'Interstellar', 
      year: '2014', 
      genre: {
        name: 'Science-Fiction',
        description:'',
      }, 
      director: {
        name: 'Christopher', 
        birth: '1970',
        death: '-',
        bio: ''
      },
      actors: {},
      imgURL:'',
    }
  ];

  app.get('/movies', (req, res) => {
    res.status(200).json(movies);
  });
  
  //(Read) responds with a json of the specific movie asked for title 
  app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.title === title );
  
    if (movie) {
      res.status(200).json(movie);
    }else{
      res.status(400).send('movie not found!')
    }
  });
  
  //(Read) responds with a json of the specific movie asked for genre 
  app.get('/movies/genres/:genre', (req, res) => {
    const genre = movies.find((movie) => movie.genre.name === req.params.genre ).genre;
  
    if (genre) {
      res.status(200).json(genre);
    }else{
      res.status(400).send('Genre not found!')
    }
  });
  
  //(Read) responds with a json of the specific movie asked for director 
  app.get('/movies/directors/:name', (req, res) => {
    const director = movies.find((movie) => movie.director.name === req.params.name).director;
  
    if (director) {
      res.status(200).json(director);
    } else {
      res.status(404).send('Director not found.')
    }
  });
  app.post('/users', (req, res) => {
    const newUser = req.body;
  
    if (newUser.username) {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser);
    }else{
      const message = 'Missing username in request body';
      res.status(400).send(message);
    };
  });
  
  //update
  app.put('/users/:username', (req, res) => {
      const newUsername = req.body;
  
      let user = users.find((user) => { return user.username === req.params.username});
  
      if (user) {
          user.username = newUsername.username;
          res.status(200).json(user);
      } else {
          res.status(400).send('user not found!')
    }
  
  });
  
  //(create) add movie to favorites list
  app.post('/users/:username/:movie', (req, res) => {
  
      let user = users.find((user) => {return user.username === req.params.username});
  
      if (user) {
        user.favorites.push(req.params.movie);
        res.status(200).send(req.params.movie + ' was added to ' + user.username + "'s favorites list.");
      } else {
        res.status(400).send('user not found!')
      };
  
  });
  
  //Delete a movie from user`s favorites list
  app.delete('/users/:username/:movie', (req, res) => {
  
    let user = users.find((user) => { return user.username === req.params.username });
  
    if (user) {
      user.favorites = user.favorites.filter((mov) => { return mov !== req.params.movie });
      res.status(200).send(req.params.movie + ' was removed from ' + user.username + "'s favorites list.");
    } else {
      res.status(400).send('user not found!')
    };
  
  });
  
  //Delete user
  app.delete('/users/:username', (req, res) => {
  
    let user = users.find( user => { return user.username === req.params.username });
  
    if (user) {
      users = users.filter((user) => { return user.username !== req.params.username });
      res.status(200).send(req.params.username + ' was deleted.');
    } else {
      res.status(400).send('user not found!')
    }
  
  });
  
  //read documentation
  // app.get('/documentation', (req, res) => {
  //   res.sendFile('public/documentation.html', { root: __dirname });
  // });
  
  //Serving Static Files
  app.use(express.static('public')); //static file given access via express static
