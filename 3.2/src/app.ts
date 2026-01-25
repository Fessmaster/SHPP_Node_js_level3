import "dotenv/config";
import express, { Response } from "express";
import path from "path";
import { upload } from "./middlewares/uploadBook.js";
import adminRouter from "./router/admin.js"
import { IBook } from "./types/types.js";
import { addNewBook } from "./utilities/utils.js"

const app = express();
const port = 3000;
// app.use(express.json())
app.use(express.static(path.join(process.cwd(), "public")));
app.use('/admin', adminRouter)


// const booksHeaderPath = path.join(
//   process.cwd(),
//   "templates/books-page",
//   "books-page-header.html",
// );
// const booksFooterPath = path.join(
//   process.cwd(),
//   "templates/books-page",
//   "books-page-footer.html",
// );
// const booksCartPath = path.join(
//   process.cwd(),
//   "templates/books-page",
//   "books-page-cart.html",
// );
// let booksHeader = "";
// let booksFooter = "";
// let booksCart = "";

// try {
//   booksHeader = await fs.readFile(booksHeaderPath, "utf-8");
//   booksFooter = await fs.readFile(booksFooterPath, "utf-8");
//   booksCart = await fs.readFile(booksCartPath, "utf-8");
// } catch (error) {
//   console.log("file not exist");
// }


app.post(
  "/admin/api/v1/addBook/",
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
    } catch (error: any) {
      console.log(`Some error during adding new book: ${error}`);
      res.status(500).json({ error: error.message });
    }
  },
);

app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});
