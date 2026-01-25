import { Router } from "express";
import { getAllBooks } from "../utilities/utils.js";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";

const router = Router();

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

export default router;