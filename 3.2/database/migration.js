import 'dotenv/config';
import {pool} from '../dist/config/db.js';
import fs from 'fs/promises';
import path from 'path';

async function migration() {
  try {
    // init migration table    
    const init = path.join(process.cwd(),'./database/init.sql');
    const sqlInit = await fs.readFile(init, 'utf-8');
    await pool.query(sqlInit);

    // get array of files names
    const migrationDir = path.join(process.cwd(), './database/migrations')
    let migrationFiles = [];
    try {
      migrationFiles = (await fs.readdir(migrationDir)).sort();      
    } catch (error) {
      console.log(`An error occurred while reading migrations files`);
    }

    if (migrationFiles.length === 0){
      console.log('Migration files are missing');
      return;
    }
    
    // added migrations if it's new
    for (const file of migrationFiles) {
      const [isMigrate] = await pool.execute('SELECT id FROM migrations WHERE file_name = ?;', [file]);
      if (isMigrate.length !== 0) {
        console.log(`Migration ${file} was added early`);
        continue;
      };
      const pathToFile = path.join(process.cwd(), 'database', 'migrations', file);
      const script = await fs.readFile(pathToFile, "utf-8");

      await pool.query(script);
      await pool.execute('INSERT INTO migrations (file_name) VALUES(?)',[file])

      console.log(`Added migration ${file}`);
      console.log();
    }

  } catch (error) {
    console.log(`Somethings's gone wrong ${error}`);
  } finally {
    await pool.end()
  }
}

migration();