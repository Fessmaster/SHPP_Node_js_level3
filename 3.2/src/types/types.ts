import { RowDataPacket } from "mysql2";
export interface IBooks extends RowDataPacket {
  title: string;
  published_year: number;
  img: string;
  name: string;
}

export interface IBook {
  bookTitle: string;
  publishedYear: string;
  pathToImg: string | null;
  authors: string[];
  about: string;
}