import { QueryParams } from "../types/types.js";


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