// import dotenv from 'dotenv';
// dotenv.config();
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from "fs/promises";
import { pool } from './config/db.js';

const app = express();
const port = 3000;
// app.use(express.json)
app.use(express.static(path.join(process.cwd(), 'public')))

async function getAllBooks() {
  const [books] = await pool.execute(`
    SELECT title, published_year, img, name
    FROM authors_books
    JOIN
    books ON books.id = book_id
    JOIN
    authors ON authors.id = author_id;`);
    console.log(books);  
}

getAllBooks()


const booksTemplatePath = path.join(process.cwd(), 'templates', 'books-page.html');
const booksTemplate = await fs.readFile(booksTemplatePath, 'utf-8');
app.get('/', (req, res) =>{
  res.send(booksTemplate)
})

app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});