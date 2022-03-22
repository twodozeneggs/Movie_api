const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(morgan('common'));

let topMovies = [
    {
        name: 'There Will Be Blood',
        director: 'Paul Thomas Anderson'
    },
    {
        name: 'Grand Budapest Hotel',
        director: 'Wes Anderson'
    },
    {
        name: 'Nice Guys',
        director: 'Shane Black'
    }
];

app.get('/movies', (req, res) => {
    res.send('Hi, Watch These Movies!');
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong...');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});