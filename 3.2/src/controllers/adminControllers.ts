import { Request, Response } from "express";
import { IBook, MyRequest } from "../types/types.js";
import {
  addNewBook,
  deleteBook,
  getBooksCollection,
  getBooksCount,
} from "../repositories/repositories.js";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";
import { validateParams } from "../utils/utils.js";
import { renderExceptionPage } from "./exceptionsControllers.js";

export async function addNewBookToDB(req: Request, res: Response) {
  try {
    if (!req.body.bookTitle || JSON.parse(req.body.authors).length === 0) {
      return res.status(400).json({ error: `Missing fields` });
    }

    const { bookTitle, publishedYear, about, pagesCount, isbn } = req.body;
    const authors = JSON.parse(req.body.authors);

    let pathToImg = null;
    if (req.file) {
      pathToImg = "books-img/" + req.file.filename;
    }
    const newBook: IBook = {
      bookTitle: bookTitle,
      publishedYear: publishedYear,
      pagesCount: pagesCount,
      isbn: isbn,
      pathToImg: pathToImg,
      authors: authors,
      about: about,
    };

    const result = await addNewBook(newBook);

    if (result.success) {
      return res.status(200).json({ ok: true, id: result.id });
    }
  } catch (error: any) {
    console.log(`Some error during adding new book: ${error}`);
    return res.status(500).json({ error: error.message });
  }
}

export async function renderAdminPage(req: Request, res: Response) {
  const limit = 10;
  const { offset, search, author, year } = req.query;
  const params = validateParams(req.query, limit);
  const messageIfDBEmpty = `
  <tr>      
    <td colspan="6" class="text-center py-4">
      <h3 class="mb-0">Відсутні книги для відображення в таблиці</h3>
    </td>
  </tr>`;

  try {
    const booksArray = await getBooksCollection({ ...params, limit: limit });
    const adminTemplateHeader = templates?.get("admin-template-head") || "";
    const adminTemplateBody = templates?.get("admin-template-body") || "";
    const bookTemplate = templates?.get("admin-template-books") || "";
    const layout = templates?.get("layout") || "";

    //Pagination
    const currentOffset = Number(offset) || 0;
    const booksCount = await getBooksCount();
    const countOfPages = Math.ceil(booksCount / limit);

    let paginationHTML = "";
    for (let i = 0; i < countOfPages; i++) {
      const nextOffset = i * limit;
      const pageNumber = i + 1;
      const isActive = currentOffset === nextOffset ? true : false;

      paginationHTML += `
      <li class="page-item ${isActive ? "active" : ""}">
      <a class="page-link" ${!isActive ? ' href="#"' : ""} data-offset=${nextOffset} ${isActive ? 'aria-current="page"' : ""}>${pageNumber}</a>
      </li>
      `;
    }

    const booksList = booksArray.map((book) => {
      const authors = book.authors_list
        .split("|")
        .map((authorsData) => authorsData.split("****")[1])
        .join(", ");
      return render(
        {
          id: book.id,
          title: book.title,
          published_year: book.published_year,
          img: book.img,
          authors_list: authors,
          views: book.views,
          orders: book.orders,
        },
        bookTemplate,
      );
    });

    const renderedTemplateBody = render(
      {
        books:
          booksArray.length !== 0
            ? booksList.join("")
            : messageIfDBEmpty,
        pagination: paginationHTML,
      },
      adminTemplateBody,
    );

    const adminTemplate = render(
      {
        head: adminTemplateHeader,
        body: renderedTemplateBody,
      },
      layout,
    );

    return res.send(adminTemplate);
  } catch (error) {    
    console.log(`An error occurred while render admin page`);
    return renderExceptionPage(res, 500);
  }
}

export async function deleteBookFromDB(req: Request, res: Response) {
  if (req.body.id) {
    const deletingBook = await deleteBook(parseInt(req.body.id));
    if (deletingBook === 1) {
      return res.status(200).json({ status: "ok" });
    } else {
      return res.status(404).json({ error: "Book not found" });
    }
  }
}

export async function adminAuth(req: MyRequest, res: Response) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Login or password invalid" });
  }

  const codedCredential = authHeader.split(" ")[1];
  const decodedCredential = Buffer.from(codedCredential, "base64").toString(
    "ascii",
  );
  const [login, password] = decodedCredential.split(":");

  if (
    login === (process.env.ADMIN_LOGIN as string) &&
    password === (process.env.ADMIN_PASSWORD as string)
  ) {
    req.session.admin = { login: login };
    const date = new Date(Date.now());
    console.log(`Administrator logged at ${date.toLocaleString("uk-UA")}`);
    return res.status(200).json({ ok: "Logged" });
  } else {
    return res.status(401).json({ error: "Login or password incorrect" });
  }
}

export async function adminLogOut(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.log(`An error occurred while logout: ${err}`);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    const date = new Date(Date.now());
    console.log(`Administrator logout at ${date.toLocaleString("uk-UA")}`);
    return res.json({ ok: true });
  });
}

export function renderAuthPage(reg: MyRequest, res: Response) {
  try {
    const template = templates?.get("login") || "";
    if (!template) {
      throw new Error();
    }
    return res.send(template);
  } catch (error) {    
    console.log(`An error occurred while rendering login template ${error}`);
    return renderExceptionPage(res, 500);
  }
}
