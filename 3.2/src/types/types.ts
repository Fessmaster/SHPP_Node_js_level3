import { RowDataPacket } from "mysql2";
import { Session } from "express-session";
import { Request } from "express";
export interface IBooksDB extends RowDataPacket {
  id: number;
  title: string;
  published_year: number;
  img: string;
  authors_list: string;
  views: number;
  orders: number;
}

export interface IBooksView {
  id: number;
  title: string;
  published_year: number;
  img: string;
  authors_list: {
    id: number;
    author: string;
  }[];
  views: number;
  orders: number;
}

export interface IBook {
  bookTitle: string;
  publishedYear: string;
  pagesCount: string;
  isbn: string;
  pathToImg: string | null;
  authors: string[];
  about: string;
}

export interface IParams {
  offset: number;
  limit: number;
  search: string | undefined;
  author: number | undefined;
  year: number | undefined;
}

interface AdminSession {
  admin?: {
    login: string;
  };
}

export interface MyRequest extends Request {
  session: Session & Partial<AdminSession>;
}
