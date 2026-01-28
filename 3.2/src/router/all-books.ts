import { Router, Response } from "express";
import { getAllBooks } from "../utilities/utils.js";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const booksArray = await getAllBooks();
    const booksTemplateHeader = templates?.get("books-template-head");
    const booksTemplateBody = templates?.get("books-template-body");
    const cartTemplate = templates?.get("books-template-cart");
    const layout = templates?.get("layout");

    const booksList = await Promise.all(
      booksArray.map((book) => render(book, cartTemplate)),
    );

    const renderedTemplateBody = await render(
      { books: booksList.join("") },
      booksTemplateBody,
    );

    const booksTemplate = await render(
      {
        head: booksTemplateHeader,
        body: renderedTemplateBody,
      },
      layout,
    );
    res.send(booksTemplate);
  } catch (error) {
    const errorTemplate = templates?.get("500-error");
    console.log(`An error occurred while render books page`);
    res.send(errorTemplate);
  }
});

export default router;