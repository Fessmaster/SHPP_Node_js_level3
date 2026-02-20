import { Router } from "express";
import {
  orderBook,
  renderBookPage,
  renderBooksPage,
} from "../controllers/booksController.js";
import { renderExceptionPage } from "../controllers/exceptionsControllers.js";

const router = Router();

router.get("/", async (req, res) => {
  await renderBooksPage(req, res);
});

router.get("/books/:id", async (req, res) => {
  await renderBookPage(req, res);
});

router.post("/books/order", async (req, res) => {
  await orderBook(req, res);
});

router.use((req, res) => {
  return renderExceptionPage(res, 404)
});
export default router;