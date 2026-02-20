import express from "express";
import { Router, Response } from "express";
import { upload } from "../middlewares/uploadBook.js";
import { MyRequest } from "../types/types.js";
import { createSession } from "../middlewares/session.js";
import { pool } from "../config/db.js";
import {
  addNewBookToDB,
  renderAdminPage,
  deleteBookFromDB,
  adminAuth,
  adminLogOut,
  renderAuthPage,
} from "../controllers/adminControllers.js";
import { renderExceptionPage } from "../controllers/exceptionsControllers.js";

const sessionConfig = await createSession(pool);
const router = Router();

router.use(sessionConfig);

router.get("/", async (req: MyRequest, res) => {
  if (!req.session.admin) {
    renderAuthPage(req, res);
    return;
  }
  await renderAdminPage(req, res);
});

router.post("/api/v1/addBook/", upload.single("book-img"), async (req, res) => {
  await addNewBookToDB(req, res);
});

router.post(
  "/api/v1/deleteBook/",
  express.json(),
  async (req, res: Response) => {
    await deleteBookFromDB(req, res);
  },
);

router.post("/api/v1/login/", async (req: MyRequest, res: Response) => {
  await adminAuth(req, res);
});

router.post("/api/v1/logout/", async (req, res) => {
  await adminLogOut(req, res);
});

router.use((req, res) => {
  return renderExceptionPage(res, 404)
});

export default router;