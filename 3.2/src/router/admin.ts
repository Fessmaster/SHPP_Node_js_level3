import express from "express";
import { Router, Response } from "express";
import { getAllBooks, deleteBook } from "../utilities/utils.js";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";
import { upload } from "../middlewares/uploadBook.js";
import { IBook } from "../types/types.js";
import { addNewBook } from "../utilities/utils.js";

const router = Router();
//TODO Додати авторизацію та підключити сесії

router.get("/", async (req, res) => {
  try {
    const booksArray = await getAllBooks();
    const adminTemplateHeader = templates?.get("admin-template-head");
    const adminTemplateBody = templates?.get("admin-template-body");
    const bookTemplate = templates?.get("admin-template-books");
    const layout = templates?.get("layout");

    const booksList = await Promise.all(
      booksArray.map((book) => render(book, bookTemplate)),
    );

    const renderedTemplateBody = await render(
      { books: booksList.join("") },
      adminTemplateBody,
    );

    const adminTemplate = await render(
      {
        head: adminTemplateHeader,
        body: renderedTemplateBody,
      },
      layout,
    );

    res.send(adminTemplate);
  } catch (error) {
    const errorTemplate = templates?.get("500-error");
    console.log(`An error occurred while render admin page`);
    res.send(errorTemplate);
  }
});

router.post(
  "/api/v1/addBook/",
  upload.single("book-img"),
  async (req, res: Response) => {
    try {
      if (!req.body.bookTitle || JSON.parse(req.body.authors).length === 0) {
        res.status(400).json({ error: `Missing fields` });
      }

      const { bookTitle, publishedYear, about } = req.body;
      const authors = JSON.parse(req.body.authors);

      let pathToImg = null;
      if (req.file) {
        pathToImg = "books-img/" + req.file.filename;
      }
      const newBook: IBook = {
        bookTitle: bookTitle,
        publishedYear: publishedYear,
        pathToImg: pathToImg,
        authors: authors,
        about: about,
      };

      const result = await addNewBook(newBook);

      if (result){
        console.log('New book added');
      }
    } catch (error: any) {
      console.log(`Some error during adding new book: ${error}`);
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/api/v1/deleteBook/",
  express.json(),
  async (req, res: Response) => {
    if (req.body.id){
      const deletingBook = await deleteBook(parseInt(req.body.id))
      console.log(deleteBook); //TODO Опрацювати результат видалення
    }
  })


export default router;