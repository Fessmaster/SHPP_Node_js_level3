import path from "node:path";
import fs from "fs/promises"

async function templateLoader() {
  const templateDir = path.join(process.cwd(), './views');
  const templateCollection = new Map();
  let templateFiles: string[] = [];
  
  try {
    templateFiles = (await fs.readdir(templateDir));  
  } catch (error) {
    console.log(`An error occurred while reading template files: ${error}`);  
  }
  
  if (templateFiles.length === 0){
    console.log('Template files are missing');
    return;
  }

  for (const file of templateFiles){    
    const templateName = file.split('.')[0]
    if (templateCollection.has(templateName)){      
      continue;
    }
    try {
      const pathToTemplate = path.join(process.cwd(), 'views', file)      
      const template = await fs.readFile(pathToTemplate, 'utf-8')
        
      templateCollection.set(templateName, template)
    } catch (error) {
      console.log(`An error occurred while adding template to collection`);
    }
  }

  return templateCollection;
}

export const templates = await templateLoader();