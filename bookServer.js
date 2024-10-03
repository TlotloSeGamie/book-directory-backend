const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const dirName = 'data';
const fileName = 'book-directory.json';
const filePath = path.join(__dirname, dirName, fileName);

app.use(express.json());

function initializeFileSystem() {
  if (!fs.existsSync(path.join(__dirname, dirName))) {
    fs.mkdirSync(path.join(__dirname, dirName));
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

function readBooks() {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeBooks(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.get('/books', (req, res) => {
  const books = readBooks();
  res.status(200).json(books);
});

app.post('/books', (req, res) => {
  const newBook = req.body;
  const books = readBooks();
  books.push(newBook); 
  writeBooks(books);
  res.status(201).json(newBook);
});

app.put('/books/:isbn', (req, res) => {
  const updatedBook = req.body;
  const { isbn } = req.params;
  let books = readBooks();
  const index = books.findIndex(book => book.isbn === isbn);

  if (index !== -1) {
    books[index] = updatedBook; 
    writeBooks(books);
    res.status(200).json(updatedBook);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

app.delete('/books/:isbn', (req, res) => {
  const { isbn } = req.params;
  let books = readBooks();
  const updatedBooks = books.filter(book => book.isbn !== isbn); 

  if (books.length !== updatedBooks.length) {
    writeBooks(updatedBooks);
    res.status(204).end(); 
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

initializeFileSystem();

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/books`);
});
