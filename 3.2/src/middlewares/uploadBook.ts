import path from 'node:path';
import multer from 'multer';
import { Request } from 'express'

//Setting for multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/books-img/');
  },
  filename: (req, file, cb) => {
    const suffix = Date.now();
    cb(null, file.fieldname + suffix + path.extname(file.originalname))
  }
})

// Settings for multer file filter
const fileFilter = (req: Request, file:Express.Multer.File, cb:any) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true)
  } else {
    cb(new Error('File type is not correct. Only JPEG ang PNG'))
  }
}

// Settings fot multer limits
const limits = {
  fileSize: 1024 * 1024 * 5, // 5Mb
  files: 1, // Count of files
  fields: 7 // Max count of fields
  
}
// Init multer middleware
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
})