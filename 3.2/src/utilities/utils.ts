import { pool } from "../config/db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { IBook, IBooks } from "../types/types.js";

export async function getAllBooks() {
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
  return books;
}

export async function addNewBook(book: IBook) {
  const authorsID: ResultSetHeader[] = [];
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

  const { bookTitle, publishedYear, about, authors, pathToImg } = book;
  const bookFields = [bookTitle, parseInt(publishedYear), pathToImg, about];
  const newBook = await pool.execute<ResultSetHeader>(addBookSQL, bookFields);

  for (const author of authors) {
    const result = await pool.execute<ResultSetHeader>(addAuthorSQL, [author]);
    authorsID.push(result[0]);
  }

  for (const author of authorsID) {
    const result = await pool.execute<ResultSetHeader>(addAuthorBookSQL, [
      author.insertId,
      newBook[0].insertId,
    ]);
    console.log(`Author_Book: ${result[0]}`);
  }
  return true; // TODO Додати якесь конкретне значення що інформує про результати додавання книги.
}