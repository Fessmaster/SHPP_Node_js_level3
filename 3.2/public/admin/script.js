function addBook(){
  const apiURL = 'http://localhost:3000/admin/api/v1/addBook';
  const formData = new FormData();
  
  const bookTitle = document.getElementById('title')?.value.trim();
  formData.append('bookTitle', bookTitle);
  
  const publishedYear = document.getElementById('published_year')?.value.trim();
  formData.append('publishedYear', publishedYear);

  const about = document.getElementById('about')?.value.trim();
  formData.append('about', about);

  const authors = [
    document.getElementById('author1')?.value,
    document.getElementById('author2')?.value,
    document.getElementById('author3')?.value
  ].filter(author => author.trim());
  formData.append('authors', JSON.stringify(authors));

  if (!bookTitle || authors.length === 0){
    alert(`Потрібно заповнити обов'язкові поля: Назва книги та Автор`);
    return;
  }

  const fileInput = document.getElementById('img');
  if (fileInput.files[0]){
    formData.append('book-img', fileInput.files[0]);
  }

  fetch(apiURL, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(response => {
    console.log(`New book was added: ${response}`);
  })
  .catch(error => console.log(`Some error occurred while adding new book ${error}`)) 
  
}

// Обробка інпута файла

const fileInput = document.getElementById('img');
console.log(`FileInput: ${fileInput}`);
let file;

fileInput.addEventListener('change', event => {
  const target = event.target

  file = target.files ? target.files[0] : null;

  if (!file){
    console.log('File not added');
    return
  }

  console.log(`File name: ${file.name}`);
  console.log(`File size: ${file.size} byte`);

  previewImg(file);
})

function previewImg(file){
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = document.getElementById('img-preview');
    const placeholder = document.getElementById('placeholder')
    placeholder.style.display = 'none';
    img.src = e.target.result;
    img.height = 170;
    img.style.display = 'inline-block'
  }
  reader.readAsDataURL(file)
}