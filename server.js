'use strict';

// dependencies

require('dotenv').config();

const express = require('express');

const cors = require('cors');

const superagent = require('superagent');

const pg = require('pg');
// const methodOverride = require('method-override');
// const expressLayouts = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);

client.on('error',err => console.error(err));
client
  .connect()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`my server is up and running on port ${PORT}`)
    );
  })
  .catch((err) => {
    throw new Error(`startup error ${err}`);
  });

// app.use(express.json());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


//Test Route
app.get('/test', (req, res) => {
  res.status(200).send('Hello ');
});

//Render index
app.get('/main', (req, res) => {
  res.render('pages/index');
});
app.get('/searchapi', (req, res) => {
  res.render('pages/searches/new');
});



//ERROR

app.get('/error', (request, response) => {
  response.render('pages/error');
});

// // function one new.ejs
// function searchForm (req, res) {
//   res.render('pages/searches/new');
// };



app.get('/', (req,res) =>
{
  let SQL = 'SELECT * FROM books ';
  client.query(SQL)
    .then(data => {
      console.log(data.rows);
      res.render('pages/index', { books: data.rows });
      // res.render('pages/indexshow');
    });
});

//SEARCHES

app.get('/searches', (req, res) => {
  res.render('pages/index');
});

app.post('/searches', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  // console.log('url link ', url);

  if (req.body.searchtype === 'title') {
    url = url+'intitle:' + req.body.search;
  }
  else if (req.body.searchtype === 'author') {
    url = url+'inauthor:' + req.body.search;
    // console.log(url)
  }

  superagent.get(url)
    .then(data => {

      // console.log(data);
      let book = data.body.items;
      res.render('pages/searches/show', { books: book });
    })
    .catch(error => {

      res.render('pages/error');
    });
});
app.get('*', function(req, res){
  res.render('pages/error');
});

// View Details
// app.get('/books/:books_id',(req,res) =>
// {
//   let SQL = 'SELECT * FROM books WHERE id=$1';
//   let values = [req.params.books_id];

//   client.query(SQL, values)
//     .then(results => {
//       res.render('pages/books/detail', { books: results.rows });
//     });
// });

// Add Book To DataBase
app.post('/add', (req,res) =>
{
  res.render('pages/serches/add',{books:req.body});
});

app.post('/detail', (req,res) =>
{
  res.render('pages/books/detail',{book:req.body});
  
});

app.post('/books', (req,res) =>
{
  let { image, title, author, des, isbn, shelf } = req.body;

  let SQL = 'INSERT INTO books (image, title, author, des, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)';
  let values = [image, title, author, des, isbn, shelf];


  client.query(SQL, values)
    .then(() => {
      res.render('pages/books/detail',{book:req.body});
    }).catch(function(err) { 
      console.log(print, err);
    });
});

// Add Book To DataBase
app.post('/show', (req,res) =>
{
  res.render('pages/books/show',{book:req.body});
});


app.listen(PORT, () => console.log('listening from port', PORT));

