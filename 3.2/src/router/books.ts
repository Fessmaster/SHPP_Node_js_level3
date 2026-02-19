import { Router } from "express";
import {
  getBookData,
  getBooksCollection,
  parserBookContent,
  updateOrders,
  updateViews,
} from "../utilities/utils.js";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";

const router = Router();

router.get("/", async (req, res) => {
  const { offset, search, author, year } = req.query;
  const limit = 20;

  const params = {
    offset: offset ? Number(offset) : 0,
    search: search ? String(search) : undefined,
    author: author ? Number(author) : undefined,
    year: year ? Number(year) : undefined,
  };

  try {
    const booksArray = await getBooksCollection({
      ...params,
      limit: limit + 1,
    });

    // console.log(`Параметри - ${params.search}`); //--------------------------
    // console.log(booksArray); //------------------------------------------
    const booksTemplateHeader = templates?.get("books-template-head") || "";
    const booksTemplateBody = templates?.get("books-template-body") || "";
    const cartTemplate = templates?.get("books-template-cart") || "";
    const layout = templates?.get("layout") || "";
    const pagination = {
      arrow_back: 'style="visibility: hidden"',
      arrow_forward: 'style="visibility: hidden"',
    };

    const parsedBookArray = parserBookContent(booksArray);

    if (parsedBookArray.length > limit) {
      pagination.arrow_forward = 'style="visibility: visible"';
      parsedBookArray.pop();
    }
    if (params.offset > 0) {
      pagination.arrow_back = 'style="visibility: visible"';
    }

    const booksList = parsedBookArray.map((book) => {
      const authors_list = book.authors_list
        .map((authorData) => authorData.author)
        .join(", ");
      return render({ ...book, authors_list: authors_list }, cartTemplate);
    });
    const renderedTemplateBody = render(
      { books: booksList.join(""), ...pagination },
      booksTemplateBody,
    );

    const booksTemplate = render(
      {
        head: booksTemplateHeader,
        body: renderedTemplateBody,
      },
      layout,
    );

    return res.status(200).send(booksTemplate);
  } catch (error) {
    const errorTemplate = templates?.get("500-error") || "";
    console.log(`An error occurred while render books page`);
    return res.send(errorTemplate);
  }
});

router.get("/books/:id", async (req, res) => {
  const bookID = Number(req.params["id"]);
  if (isNaN(bookID)) {
    console.log(`Bad request. Book ID is not a number`);
    return res.status(400).send(templates?.get("404-error") || "");
  }
  const bookData = await getBookData(bookID);
  if (!bookData || bookData.length === 0 || !bookData[0]?.id) {
    console.log(`Book with ID ${req.params["id"]} not found`);
    return res.status(404).send(templates?.get("404-error") || "");
  }
  const parsedData = parserBookContent(bookData)[0];

  try {
    await updateViews(bookID);
  } catch (error) {
    console.log(`An error occurred while updated views`);
  }

  const html = parsedData.authors_list
    .map(
      (author) =>
        `<a href="#" class="author_id" data-filter="author" data-value="${author.id}">${author.author}</a>`,
    )
    .join("\n");

  const bookTemplateHeader = templates?.get("book-template-head") || "";
  const bookTemplateBody = templates?.get("book-template-body") || "";
  const layout = templates?.get("layout") || "";

  const renderTemplateBody = render(
    { ...parsedData, authors_list: html },
    bookTemplateBody,
  );
  const renderTemplateHead = render(
    { title: parsedData.title },
    bookTemplateHeader,
  );
  const renderPage = render(
    {
      head: renderTemplateHead,
      body: renderTemplateBody,
    },
    layout,
  );
  return res.status(200).send(renderPage);
});

router.post("/books/order", async (req, res) => {
  const bookID = Number(req.body.id);
  if (isNaN(bookID)) {
    console.log(`Bad request in order`);
    return res.status(400).json({ error: "Bad request" });
  }
  try {
    await updateOrders(bookID);
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.log(`An error occurred while update orders`);
    return res.status(500).json({ status: "error" });
  }
});

export default router;
