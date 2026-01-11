import 'dotenv/config';
import express, { Response } from 'express';
import path from 'path';
import fs from "fs/promises";
import { pool } from './config/db.js';
import { RowDataPacket } from 'mysql2'

const app = express();
const port = 3000;
app.use(express.json())
app.use(express.static(path.join(process.cwd(), 'public')))


interface IBooks extends RowDataPacket {
  title:string,
  published_year: number,
  img: string,
  name: string
}

interface IBook {
  bookTitle: string,
  publishedYear: string,
  pathToImg: string,
  authors: string[],
  about: string
}

async function getAllBooks(){  
  const [books] = await pool.execute<IBooks[]>(`
    SELECT title, published_year, img, name
    FROM authors_books
    JOIN
    books ON books.id = book_id
    JOIN
    authors ON authors.id = author_id;`);    
  return books  
}

const booksArray = await getAllBooks();
async function booksPageTemplater(obj:IBooks[], template: string) {
  let pageTemplate = ''
  for (const book of obj){
    const currentBook = template; 
    
    pageTemplate+=currentBook
    .replaceAll('{title}',book.title)
    .replace('{path-to-img}',book.img)
    .replaceAll('{name}',book.name)
    .replaceAll('{published_year}',book.published_year.toString())
  }    
  return pageTemplate  
}

parseInt

async function addBook(book: IBook) {
  const newBook = await pool.execute(`
    INSERT INTO books
    (title, published_year, img, about)
    VALUES
    (?, ?, ?, ?);`,
    [book.bookTitle, 
      parseInt(book.publishedYear), 
      book.pathToImg, 
      book.about])

}

const booksHeaderPath = path.join(process.cwd(), 'templates/books-page', 'books-page-header.html');
const booksFooterPath = path.join(process.cwd(), 'templates/books-page', 'books-page-footer.html');
const booksCartPath = path.join(process.cwd(), 'templates/books-page', 'books-page-cart.html');
let booksHeader = '';
let booksFooter = '';
let booksCart = '';

const adminHeaderPath = path.join(process.cwd(), 'templates/admin-template', 'admin-template-header.html');
const adminFooterPath = path.join(process.cwd(), 'templates/admin-template', 'admin-template-footer.html');
const adminBookItemPath = path.join(process.cwd(), 'templates/admin-template', 'admin-template-book-item.html');

let adminHeader = '';
let adminFooter = '';
let adminBookItem = '';

try {
  booksHeader = await fs.readFile(booksHeaderPath, 'utf-8');
  booksFooter = await fs.readFile(booksFooterPath, 'utf-8');
  booksCart = await fs.readFile(booksCartPath, 'utf-8');

  adminHeader = await fs.readFile(adminHeaderPath, 'utf-8');
  adminFooter = await fs.readFile(adminFooterPath, 'utf-8');
  adminBookItem = await fs.readFile(adminBookItemPath, 'utf-8');
} catch (error) {
  console.log('file not exist');  
}

app.get('/', async (req, res) =>{
  res.send(adminHeader + await booksPageTemplater(booksArray, adminBookItem) + adminFooter)
});

app.post('/admin/api/v1/addBook/', async (req, res: Response) => {
  const {bookTitle, pathToImg, publishYear, about, authors} = req.body;

  if (!bookTitle || authors.length === 0){
    res.status(400).json({'error':`Missing fields`})
  }

  const newBook = {bookTitle, pathToImg, publishYear, about, authors};
  const result = await addNewBook(newBook);
})

app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});