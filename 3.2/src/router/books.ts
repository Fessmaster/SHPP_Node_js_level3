import { Router, Response } from "express";
import { getBooksCollection } from "../utilities/utils.js";
import { templates } from "../templater/templateLoader.js";
import { render } from "../templater/render.js";
import { IBook, IBooksDB, IBooksView, IParams } from "../types/types.js";

const router = Router();

router.get("/", async (req, res) => {

  const { offset, search, author, year } = req.query
  const limit = 20; 
  
  const params = {
    offset: offset ? Number(offset) : 0,
    search: search ? String(search) : undefined,
    author: author ? Number(author) : undefined,
    year: year ? Number(year) : undefined
  } 

  try {    
    const booksArray = await getBooksCollection({...params, limit: limit+1});
    // console.log(booksArray);
    const booksTemplateHeader = templates?.get("books-template-head");
    const booksTemplateBody = templates?.get("books-template-body");
    const cartTemplate = templates?.get("books-template-cart");
    const layout = templates?.get("layout");
    const pagination = {arrow_back: 'hidden', arrow_forward: 'hidden'}    

    function parserBookContent (arr: IBooksDB[]): IBooksView[]{
      const booksArray = arr.map(book => {        
        return {
          ...book,
          // parsing string with authors data from DB
          authors_list: book.authors_list.split('|').map(authorsData => {
            const [id, author] = authorsData.split('****');
            return {
              id: Number(id),
              author: author
            }
          })
        }
      })
      return booksArray
    }
    const testArray = parserBookContent(booksArray);
    for (const book of testArray){
      console.log(book.authors_list);
    }   
    
    if (booksArray.length > limit){      
      pagination.arrow_forward = 'visible' 
      booksArray.pop()
    }
    if (params.offset > 0){      
      pagination.arrow_back = 'visible'
    }    

    const booksList = await Promise.all(
      booksArray.map((book) => render(book, cartTemplate)),
    );

    const renderedTemplateBody = await render(
      { books: booksList.join(''), ...pagination },
      booksTemplateBody,
    );

    const booksTemplate = await render(
      {
        head: booksTemplateHeader,
        body: renderedTemplateBody,
      },
      layout,
    );

    return res.status(200).send(booksTemplate);
  } catch (error) {
    const errorTemplate = templates?.get("500-error");
    console.log(`An error occurred while render books page`);
    return res.send(errorTemplate);
  }
});

export default router;