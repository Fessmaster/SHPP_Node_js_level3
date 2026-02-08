import { pool } from "../config/db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { IBook, IBooksDB, IParams } from "../types/types.js";
import { RequestHandler } from "express";
import QueryString, { ParsedQs } from "qs";

export async function getBooksCollection(params: IParams) {
  const {offset, search, author, year, limit} = params;  
  const values = []
  let sql = `
SELECT
books.id,
books.title, 
books.published_year, 
books.img,
GROUP_CONCAT(CONCAT(authors.id,'****',authors.name) SEPARATOR'|') AS authors_list
FROM authors_books
JOIN books ON books.id = authors_books.book_id
JOIN authors ON authors.id = authors_books.author_id
WHERE books.delete_at IS NULL`;

  if (search){
    sql +=' AND books.title LIKE ?';
    values.push(`%${search}%`)
  }
  if (author){
    sql += ' AND authors.id = ?';
    values.push(author)
  }
  if (year){
    sql += ' AND books.published_year = ?';
    values.push(year)
  }

  sql += `  
GROUP BY books.id
LIMIT ? OFFSET ?;
  `
  values.push(limit);
  values.push(offset);

  try {
    const [books] = await pool.query<IBooksDB[]>(sql, values);  
    return books;    
  } catch ( err ) {    
    console.log(`Bad sql request`);
    console.log(err);
    return []
  }
}

export async function addNewBook(book: IBook) {  
  const connection = await pool.getConnection();
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
  try {
    await connection.beginTransaction();
    const [bookResult] = await connection.execute<ResultSetHeader>(addBookSQL, bookFields);
    const bookId = bookResult.insertId;
  
    for (const authorName of authors) {
      const [authorResult] = await connection.execute<ResultSetHeader>(addAuthorSQL, [authorName]);
      const authorId = authorResult.insertId;

      await connection.execute(addAuthorBookSQL, [authorId, bookId])
    }  

    await connection.commit();
    console.log(`New book added to DB with ID: ${bookId}`);
    return {success: true, id: bookId}
  } catch (error) {
    await connection.rollback();
    console.log('An error occurred while adding new book');
    throw error;    
  } finally {
    connection.release();
  }  
}

export async function deleteBook(id: number) {
  const deleteSQL = `
  UPDATE books 
  SET books.delete_at = NOW()
  WHERE books.id = ?;`  

  const [result] = await pool.execute<ResultSetHeader>(deleteSQL, [id])  

  return result.affectedRows;
}