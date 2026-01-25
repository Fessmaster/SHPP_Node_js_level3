import 'dotenv/config';
import express, { Response } from 'express';
import path from 'path';
import fs from "fs/promises";
import { pool } from './config/db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import { upload } from './middlewares/uploadBook.js';
import { render } from './templater/render.js';
import { templates } from './templater/templateLoader.js';

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
    SELECT 
    books.title, 
    books.published_year, 
    books.img, 
    GROUP_CONCAT(authors.name SEPARATOR ', ') AS authors_list 
FROM authors_books
JOIN books ON books.id = authors_books.book_id
JOIN authors ON authors.id = authors_books.author_id
GROUP BY books.id;`);    
  return books  
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

try {
  booksHeader = await fs.readFile(booksHeaderPath, 'utf-8');
  booksFooter = await fs.readFile(booksFooterPath, 'utf-8');
  booksCart = await fs.readFile(booksCartPath, 'utf-8');
  
} catch (error) {
  console.log('file not exist');  
}

app.get('/admin', async (req, res) =>{
  const booksArray = await getAllBooks();
  const adminTemplateHeader = templates?.get('admin-template-head');
  const layout = templates?.get('layout')  
  let booksList = '';
  for (const book of booksArray) { //TODO Переписати через map-метод масивів
    booksList += await render(book, templates?.get('admin-template-books'))
  }
  const adminTemplateBody = await render({'books': booksList}, templates?.get('admin-template-body'))
  const adminTemplate = await render ({
    'head': adminTemplateHeader, 
    'body': adminTemplateBody
  }, layout);
  
  res.send(adminTemplate);
}); 
// TODO оновлювати список одразу після додавання нової книги

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