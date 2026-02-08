import "dotenv/config";
import express, { Response } from "express";
import path from "path";
import adminRouter from "./router/admin.js"
import booksRouter from "./router/books.js"


const app = express();
const port = 3000;
// app.use(express.json())
app.use(express.static(path.join(process.cwd(), "public")));
app.use('/admin', adminRouter)
app.use('/', booksRouter)

app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});