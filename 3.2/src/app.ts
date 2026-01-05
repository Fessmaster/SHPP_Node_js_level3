import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from "fs/promises";
import { pool } from './config/db.js';
import { QueryResult } from 'mysql2';
import { RowDataPacket } from 'mysql2'

const app = express();
const port = 3000;
// app.use(express.json)
app.use(express.static(path.join(process.cwd(), 'public')))

// деталі інтервейса -------------------------------------
interface IBooks extends RowDataPacket {
  title:string,
  published_year: number,
  img: string,
  name: string
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
  }
  
  return pageTemplate  
}





const booksHeaderPath = path.join(process.cwd(), 'templates', 'books-page-header.html');
const booksFooterPath = path.join(process.cwd(), 'templates', 'books-page-footer.html');
const booksCartPath = path.join(process.cwd(), 'templates', 'books-page-cart.html');
const booksHeader = await fs.readFile(booksHeaderPath, 'utf-8');
const booksFooter = await fs.readFile(booksFooterPath, 'utf-8');
const booksCart = await fs.readFile(booksCartPath, 'utf-8');

app.get('/', async (req, res) =>{
  res.send(booksHeader + await booksPageTemplater(booksArray, booksCart) + booksFooter)
})

app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});