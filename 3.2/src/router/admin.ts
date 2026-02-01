import express from "express";
import { Router, Response } from "express";
import { getAllBooks, deleteBook } from "../utilities/utils.js";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";
import { upload } from "../middlewares/uploadBook.js";
import { IBook } from "../types/types.js";
import { addNewBook } from "../utilities/utils.js";
import { createSession } from "../middlewares/session.js";
import { pool } from "../config/db.js";
import { Session } from "express-session";
import { Request } from "express";
import { error } from "node:console";

interface AdminSession {
  admin?: { 
    login: string    
  };
}

interface MyRequest extends Request {
  session: Session & Partial<AdminSession>;
}


const sessionConfig = await createSession(pool)
const router = Router();
//TODO Додати авторизацію та підключити сесії

router.use(sessionConfig);

router.get("/", async (req: MyRequest, res) => {  
  if (!req.session.admin){
    loginTemplate(req, res);
    return;
    }

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

    return res.send(adminTemplate);
  } catch (error) {
    const errorTemplate = templates?.get("500-error");
    console.log(`An error occurred while render admin page`);
    return res.send(errorTemplate);
  }
});

router.post(
  "/api/v1/addBook/",
  upload.single("book-img"),
  async (req, res: Response) => {
    try {
      if (!req.body.bookTitle || JSON.parse(req.body.authors).length === 0) {
        return res.status(400).json({ error: `Missing fields` });
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

      if (result.success){
        return res.status(200).json({ok:true, id:result.id});
      }
    } catch (error: any) {
      console.log(`Some error during adding new book: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/api/v1/deleteBook/",
  express.json(),
  async (req, res: Response) => {
    if (req.body.id){
      const deletingBook = await deleteBook(parseInt(req.body.id))
      if (deletingBook === 1){
        return res.status(200).json({ status: 'ok' })
      } else{
        return res.status(404).json({ error: "Book not found" })
      }
    }
  })


router.post(
  "/api/v1/login/",  
  async (req: MyRequest, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader){
      return res.status(401).json({error: "Login or password invalid"})
    }
    
    const codedCredential = authHeader.split(' ')[1];
    
    const decodedCredential = Buffer.from(codedCredential, 'base64').toString('ascii');
    const [login, password] = decodedCredential.split(':');

    if(
      login === process.env.ADMIN_LOGIN as string &&
      password === process.env.ADMIN_PASSWORD as string
    ) {
      req.session.admin = {login: login}
      const date = new Date(Date.now());
      console.log(`Administrator logged at ${date.toLocaleString('uk-UA')}`);
      return res.status(200).json({ok: 'Logged'})
    } else {
      return res.status(401).json({error:'Login or password incorrect'})
    }
  })

  router.post("/api/v1/logout/", async (req, res) => {
    req.session.destroy((err)=>{
      if (err){
        console.log(`An error occurred while logout: ${err}`);
        return res.status(500).json({error: 'Logout failed'});
      }
      res.clearCookie('connect.sid');
      const date = new Date(Date.now());
      console.log(`Administrator logout at ${date.toLocaleString('uk-UA')}`);
      return res.json({ok: true})
    })
  })

  function loginTemplate(reg: MyRequest, res:Response){
    try {
      const template = templates?.get('login')
      if (!template){
        throw new Error
      }
      return res.send(template)
    } catch (error) {
      const errorTemplate = templates?.get("500-error");
      console.log(`An error occurred while rendering login template ${error}`);
      return res.send(errorTemplate);
    }
  }


export default router;