import 'dotenv/config'
import {pool} from '../dist/config/db.js';
import path from 'path';
import fs from 'fs'
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const pathToLogFile = path.join(dirname, 'logs', 'deleting_log.txt')
const sql = `
DELETE from books
WHERE books.delete_at <= NOW() - INTERVAL 5 SECOND`;
const date = new Date(Date.now()).toLocaleString('uk-UA');
const successMessage = `
-- ${date}
З бази даних було остаточно видалено таку кількість книг -`

const failureMessage = `
-- ${date}
Під час видалення з бази даних сталась помилка: `

try {  
  const [result] = await pool.execute(sql)
  fs.appendFileSync(pathToLogFile, successMessage + ' ' + result.affectedRows + '\n')  
  await pool.end();  
  process.exit(0);
} catch (error) {
  fs.appendFileSync(pathToLogFile, failureMessage + error + '\n');
  process.exit(1); 
}
