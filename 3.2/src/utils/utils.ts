import { IBooksDB, IBooksView, QueryParams } from "../types/types.js";

/**
 * The function accepts a complex parameters object and returns a simple
 * and validated object
 * 
 * @param query - query parameters from the frontend
 * @param limit - limit of books to return from the database
 * @returns - object of type QueryParams
 */
export function validateParams(query:any, limit:number): QueryParams{
  const {offset, search, author, year} = query

    return {
    offset: offset ? Number(offset) : 0,
    search: search ? String(search) : undefined,
    author: author ? Number(author) : undefined,
    year: year ? Number(year) : undefined,
    limit: limit
  };
}

/**
 * The function accepts book data as an array of objects and
 * transforms the authors field, which is a string, by parsing it
 * into a structured array of objects
 * 
 * @param arr - array of objects from the database
 * @returns - transformed array of objects
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