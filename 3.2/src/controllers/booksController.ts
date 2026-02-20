import { Request, Response } from "express";
import {
  getBookData,
  getBooksCollection,
  parserBookContent,
  updateOrders,
  updateViews,
} from "../repositories/repositories.js";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";
import { validateParams } from "../utils/utils.js";
import { renderExceptionPage } from "./exceptionsControllers.js";

export async function renderBooksPage(req: Request, res: Response) {
  const limit = 20;
  const params = validateParams(req.query, limit);

  try {
    const booksArray = await getBooksCollection({
      ...params,
      limit: limit + 1,
    });

    const booksTemplateHeader = templates?.get("books-template-head") || "";
    const booksTemplateBody = templates?.get("books-template-body") || "";
    const cartTemplate = templates?.get("books-template-cart");
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
    if (params.offset && params.offset > 0) {
      pagination.arrow_back = 'style="visibility: visible"';
    }

    const booksList = parsedBookArray.map((book) => {
      const authors_list = book.authors_list
        .map((authorData) => authorData.author)
        .join(", ");
      return render({ ...book, authors_list: authors_list }, cartTemplate);
    });

    const noResultMessage = `
      <div style="display: flex; justify-content: center; align-items: center; height: 80vh;">
      <img src="../img/error/204.jpg" alt="error" style="max-width: 100%;">
      </div>`;
    
    const renderedTemplateBody = render(
      { books: booksArray.length !== 0
        ? booksList.join("")
        : noResultMessage, ...pagination },
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
    console.log(`An error occurred while render books page`);
    return renderExceptionPage(res, 500)
  }
}

export async function renderBookPage(req: Request, res: Response) {
  const bookID = Number(req.params["id"]);
  if (isNaN(bookID)) {
    console.log(`Bad request. Book ID is not a number`);
    return renderExceptionPage(res, 404);
  }
  const bookData = await getBookData(bookID);
  if (!bookData || bookData.length === 0 || !bookData[0]?.id) {
    console.log(`Book with ID ${req.params["id"]} not found`);
    return renderExceptionPage(res, 404);
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
}

export async function orderBook(req: Request, res: Response) {
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
}