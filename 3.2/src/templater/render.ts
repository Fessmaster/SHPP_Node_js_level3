export function render(data:Record<string, string | number>, template:string) {
  const regex = /\{\{\s*(\w+)\s*\}\}/g; 
  return template.replace(regex, (match, key) => {    
    return data[key] !== undefined ? String(data[key]) : ''
  })
}