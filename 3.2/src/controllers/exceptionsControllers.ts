import { Response } from "express";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";

/**
* Generates a fallback page for the corresponding error
*
* @param res - Response object
* @param code - Error code
* @returns - Generated error page
*/
export function renderExceptionPage(res: Response, code: number) {
  const layoutTemplate = templates?.get("layout") || "";
  const headTemplate = templates?.get("book-template-head") || "";
  const exceptionTemplate = templates?.get("exception") || "";
  const exceptionHtml = `
  <div style="display: flex; justify-content: center; align-items: center; height: 80vh;">
    <img src="/img/error/${code}.jpg" alt="error" style="max-width: 100%;">
  </div>`;
  const renderedHead = render(
    { title: `Сталась помилка ${code}` },
    headTemplate,
  );
  const renderedException = render(
    { exception: exceptionHtml },
    exceptionTemplate,
  );
  const page = render(
    {
      head: renderedHead,
      body: renderedException,
    },
    layoutTemplate,
  );

  return res.status(code).send(page);
}
