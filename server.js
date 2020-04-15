'use strict';

// dependencies

require('dotenv').config();

const express = require('express');

const cors = require('cors');

const superagent = require('superagent');

const pg = require('pg');
const methodOverride = require('method-override');//new


const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);

client.on('error',err => console.error(err));



// app.use(express.json());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));//new
app.use(methodOverride(updefunction));//new
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

// function errorHandler(err, req, res) {
//   res.status(500).render('pages/error-view', { error: err });
// }


app.get('/', (req,res) =>
{
  let SQL = 'SELECT * FROM books ';
  client.query(SQL)
    .then(data => {
      // console.log(data.rows);
      res.render('pages/index', { books: data.rows });
      // res.render('pages/indexshow');
    });
});

//SEARCHES

app.get('/searches', (req, res) => {
  res.render('pages/index');
});
// app.put('/update/:book_id',updatebook);
// app.delete('/delete/:book_id',deletebook);

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
  let SQL = "SELECT id from books where image=$1 and title=$2 and author=$3 and des=$4 and isbn=$5 and bookshelf=$6";
  let { image, title, author, des, isbn, shelf } = req.body;
  let values = [image, title, author, des, isbn, shelf];
  client.query(SQL, values)
    .then(results => {
      let id = results.rows[0].id;
      res.render('pages/books/detail',{book:{id, image, title, author, des, isbn, shelf }} );
    }).catch(function(err) {
      console.log(err);
    });
    

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


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function updatebook(req,res){

//   const { image, title, author, des, isbn, shelf } = req.body;
//   const SQL = 'UPDATE books SET image=$1, title=$2, author=$3, des=$4, isbn=$5, shelf=$6 WHERE id=$7';
//   const values = [image, title, author, des, isbn, shelf, req.params.books_id,];
//   client.query(SQL, values)
//     .then(() => res.redirect(`/books/${req.params.books_id}`))
//     .catch((err)=>errorHandler(err,req,res));
// }

// Update book details by clicking and show up the form to be able to update
app.post('/update', (req, res) => {
  // console.log('req.body : ', req.body);
  res.render('pages/books/edit', { books: req.body });
});

// After finished update save the updated details into DB then redirect me to Homepage
app.post('/editbook', (req, res) => {

  let { id, image, title, author, des, isbn, bookshelf} = req.body;
  // console.log({ id, image, title, author, des, isbn, bookshelf});
  // console.log('req.body : ', req.body);

  let SQL = 'UPDATE books SET image=$1, title=$2, author=$3, des=$4, isbn=$5, bookshelf=$6 WHERE id=$7';
  // console.log('SQL : ', SQL);

  let values = [image, title, author, des, isbn, bookshelf, id];
  // console.log('values : ', values);

  client.query(SQL, values)
    .then(() => {
      res.redirect('/');
    });
});


//////////////////////////////////////////////////////////////////////

// Delete Book
// function deletebook(req,res){
//   const SQL = 'DELETE FROM books WHERE id=$1';
//   const values = [req.params.books_id];

//   client.query(SQL, values)
//     .then(() =>res.redirect('/'))
//     .catch((err)=>errorHandler(err,req,res));

// }


// Delete Book
app.delete('/delete/:books_id', (req,res) =>
{
  let SQL = 'DELETE FROM books WHERE id=$1';
  // console.log('SQL : ', SQL);
  let values = [req.params.books_id];
  // // console.log('values : ', values);

  client.query(SQL, values)
    .then(() => {
      res.redirect('/');
    });
});

// For update and Delete , build-in function as it is .
function updefunction(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
} // end of middleware function

console.log(updefunction);

//////////////////////////////////////////////////////////////////////
// app.listen(PORT, () => console.log('listening from port', PORT));
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

