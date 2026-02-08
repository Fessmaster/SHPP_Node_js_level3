import { RowDataPacket } from "mysql2";
export interface IBooksDB extends RowDataPacket {
  title: string;
  published_year: number;
  img: string;  
  authors_list: string
}

export interface IBooksView {
  title: string;
  published_year: number;
  img: string;  
  authors_list:{
    id: number,
    author: string
  }[]
}

export interface IBook {
  bookTitle: string;
  publishedYear: string;
  pathToImg: string | null;
  authors: string[];
  about: string;
}

export interface IParams {
  offset: number,
  limit: number,
  search: string | undefined,
  author: number | undefined,
  year: number | undefined
}