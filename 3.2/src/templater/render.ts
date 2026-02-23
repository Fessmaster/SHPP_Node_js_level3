/**
 * The function replaces keys found in the provided template with the corresponding
 * values from the object, or inserts an empty string.
 * Example of a key in the template - {{ title }}
 * 
 * @param data - object with data for populating the template
 * @param template - template with keys that need to be replaced with data
 * @returns - template filled with data
 */

export function render(data:Record<string, string | number>, template:string) {
  const regex = /\{\{\s*(\w+)\s*\}\}/g; 
  return template.replace(regex, (match, key) => {    
    return data[key] !== undefined ? String(data[key]) : ''
  })
}