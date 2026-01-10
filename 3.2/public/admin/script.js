function addBook(title, year, img, about, name1, name2, name3){
  const apiURL = 'http://localhost:3000/admin/api/';
  const apiVersion = 'v1/';
  const param = 'addBook';

  
  const authors = [
    document.getElementById(name1),
    document.getElementById(name2),
    document.getElementById(name3)
  ].filter(name => name?.trim());
  
  const newBook = {
    title: document.getElementById(title),
    published_year: document.getElementById(year),
    img: document.getElementById(img),
    about: document.getElementById(about),
    author: authors
  };

 

  
  fetch(apiURL + apiVersion + param, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(userData) 
})
.then(response => response.json())
.then(result => console.log('Успіх:', result))
.catch(error => console.error('Помилка:', error))
}