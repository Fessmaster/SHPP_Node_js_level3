import { pool } from "../config/db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  IBook,
  IBooksDB,
  IBooksView,  
  QueryParams,
} from "../types/types.js";

interface BookCount extends RowDataPacket {
  total: number;
}

/**
 *
 * @param params
 * @returns
 */
export async function getBooksCollection(params: QueryParams) {
  const { offset, search, author, year, limit } = params;
  const values = [];
  let sql = `
SELECT
books.id,
books.title, 
books.published_year, 
books.img,
books.views,
books.orders,
GROUP_CONCAT(CONCAT(authors.id,'****',authors.name) SEPARATOR'|') AS authors_list
FROM authors_books
JOIN books ON books.id = authors_books.book_id
JOIN authors ON authors.id = authors_books.author_id
WHERE books.delete_at IS NULL`;

  if (search) {
    sql += " AND books.title LIKE ?";
    values.push(`%${search}%`);
  }
  if (author) {
    sql += " AND authors.id = ?";
    values.push(author);
  }
  if (year) {
    sql += " AND books.published_year = ?";
    values.push(year);
  }

  sql += `  
GROUP BY books.id
LIMIT ? OFFSET ?;
  `;
  values.push(limit);
  values.push(offset);

  try {
    const [books] = await pool.query<IBooksDB[]>(sql, values);
    return books;
  } catch (err) {
    console.log(`Bad sql request`);
    return [];
  }
}

export async function getBookData(id: number) {
  const sql = `
SELECT
books.id,
books.title, 
books.published_year,
books.pages_count,
books.isbn,
books.about,
books.img,
books.views,
books.orders,
GROUP_CONCAT(CONCAT(authors.id,'****',authors.name) SEPARATOR'|') AS authors_list
FROM authors_books
JOIN books ON books.id = authors_books.book_id
JOIN authors ON authors.id = authors_books.author_id
WHERE books.delete_at IS NULL AND books.id = ?
`;
  try {
    const [books] = await pool.query<IBooksDB[]>(sql, id);
    return books;
  } catch (err) {
    console.log(`Bad sql request`);
    console.log(err);
    return [];
  }
}

/**
 *
 * @param book
 * @returns
 */
export async function addNewBook(book: IBook) {
  const connection = await pool.getConnection();
  const addBookSQL = `
INSERT INTO books
(title, published_year, pages_count, isbn, img, about)
VALUES
(?, ?, ?, ?, ?, ?);`;

  const addAuthorSQL = `
INSERT INTO authors (name) VALUES (?) 
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);`;

  const addAuthorBookSQL = `
INSERT INTO authors_books
(author_id, book_id)
VALUES
(?,?);`;

  const {
    bookTitle,
    publishedYear,
    pagesCount,
    isbn,
    about,
    authors,
    pathToImg,
  } = book;
  const bookFields = [
    bookTitle,
    parseInt(publishedYear),
    parseInt(pagesCount),
    isbn,
    pathToImg,
    about,
  ];
  try {
    await connection.beginTransaction();
    const [bookResult] = await connection.execute<ResultSetHeader>(
      addBookSQL,
      bookFields,
    );
    const bookId = bookResult.insertId;
    
    for (const authorName of authors) {      
      const [authorResult] = await connection.execute<ResultSetHeader>(
        addAuthorSQL,
        [authorName],
      );
      const authorId = authorResult.insertId;

      await connection.execute(addAuthorBookSQL, [authorId, bookId]);
    }

    await connection.commit();
    console.log(`New book added to DB with ID: ${bookId}`);
    return { success: true, id: bookId };
  } catch (error) {
    await connection.rollback();
    console.log("An error occurred while adding new book");
    throw error;
  } finally {
    connection.release();
  }
}

/**
 *
 * @param id
 * @returns
 */
export async function deleteBook(id: number) {
  const deleteSQL = `
  UPDATE books 
  SET books.delete_at = NOW()
  WHERE books.id = ?;`;

  const [result] = await pool.execute<ResultSetHeader>(deleteSQL, [id]);

  return result.affectedRows;
}

/**
 *
 * @param arr
 * @returns
 */
export function parserBookContent(arr: IBooksDB[]): IBooksView[] {
  try {
    const booksArray = arr.map((book) => {
      return {
        ...book,
        // parsing string with authors data from DB
        authors_list: book.authors_list.split("|").map((authorsData) => {
          const [id, author] = authorsData.split("****");
          return {
            id: Number(id),
            author: author,
          };
        }),
      };
    });
    return booksArray;
  } catch (error) {
    console.log(`Array is empty`);
    return [];
  }
}

export async function updateViews(id: number) {
  const sql = `
UPDATE books
SET books.views = books.views + 1
WHERE books.id = ?`;
  try {
    const [updatedBook] = await pool.execute(sql, [id]);
  } catch (error) {
    console.log(`Error while update views`);
  }
}

export async function updateOrders(id: number) {
  const sql = `
UPDATE books
SET books.orders = books.orders + 1
WHERE books.id = ?`;
  try {
    const [updatedBook] = await pool.execute(sql, [id]);
  } catch (error) {
    console.log(`Error while update orders`);
  }
}

export async function getBooksCount() {
  const sql = `
SELECT COUNT(*) AS total FROM books
`;
  try {
    const [count] = await pool.execute<BookCount[]>(sql);
    return count[0]?.total || 0;
  } catch (error) {
    console.log("Bad sql request");
    return 0;
  }
}
