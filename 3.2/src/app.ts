import 'dotenv/config';
import express, { Response } from 'express';
import path from 'path';
import fs from "fs/promises";
import { pool } from './config/db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import { upload } from './middlewares/uploadBook.js';

const app = express();
const port = 3000;
// app.use(express.json())
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
  pathToImg: string | null,
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

async function addNewBook(book: IBook) {
  const authorsID:ResultSetHeader[] = [];
  const addBookSQL = `
INSERT INTO books
(title, published_year, img, about)
VALUES
(?, ?, ?, ?);`;
  
  const addAuthorSQL = `
INSERT INTO authors (name) VALUES (?) 
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);`;

const addAuthorBookSQL = `
INSERT INTO authors_books
(author_id, book_id)
VALUES
(?,?);`;

  const {bookTitle, publishedYear, about, authors, pathToImg} = book;
  const bookFields = [bookTitle, parseInt(publishedYear), pathToImg, about];
  const newBook = await pool.execute<ResultSetHeader>(addBookSQL, bookFields);
 

  for (const author of authors){
    const result = await pool.execute<ResultSetHeader>(addAuthorSQL, [author])
    authorsID.push(result[0])    
  }

  for (const author of authorsID){    
    const result = await pool.execute<ResultSetHeader>(addAuthorBookSQL, [author.insertId, newBook[0].insertId])
    console.log(`Author_Book: ${result[0]}`);
  }
  return true; // TODO Додати якесь конкретне значення що інформує про результати додавання книги.
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
  const booksArray = await getAllBooks();
  const adminBooksList = await booksPageTemplater(booksArray, adminBookItem);
  res.send(adminHeader + adminBooksList + adminFooter)
}); // TODO оновлювати список одразу після додавання нової книги

app.post('/admin/api/v1/addBook/', upload.single('book-img'),  async (req, res: Response) => {  
  try {
    
    if (!req.body.bookTitle || JSON.parse(req.body.authors).length === 0){
      res.status(400).json({'error':`Missing fields`})
    }
    
    const { bookTitle, publishedYear, about} = req.body;
    const authors = JSON.parse(req.body.authors);

    let pathToImg = null;
    if(req.file){
      pathToImg = 'books-img/' + req.file.filename;
    }    
    const newBook: IBook = {
      bookTitle: bookTitle,
      publishedYear: publishedYear,
      pathToImg: pathToImg,
      authors: authors,
      about: about,
    };

  const result = await addNewBook(newBook);
    
  } catch (error: any) {
    console.log(`Some error during adding new book: ${error}`);
    res.status(500).json({error: error.message})
  }
  
})



app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});