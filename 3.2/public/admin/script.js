const BASE_URL = "http://localhost:3000";
const adminPath = "/admin";
const apiVersion = "/api/v1";

function addBook() {
  const routHandler = "/addBook";
  const URL = BASE_URL + adminPath + apiVersion + routHandler;
  const formData = new FormData();

  const bookTitle = document.getElementById("title")?.value.trim();
  formData.append("bookTitle", bookTitle);

  const publishedYear = document.getElementById("published_year")?.value.trim();
  formData.append("publishedYear", publishedYear);

  const pagesCount = document.getElementById("pages_count")?.value.trim();
  formData.append("pagesCount", pagesCount);

  const isbn = document.getElementById("isbn")?.value.trim();
  formData.append("isbn", isbn);

  const about = document.getElementById("about")?.value.trim();
  formData.append("about", about);

  const authors = [
    document.getElementById("author1")?.value,
    document.getElementById("author2")?.value,
    document.getElementById("author3")?.value,
  ].filter((author) => author.trim());
  const uniqAuthors = [... new Set(authors.map(author => author))]
  formData.append("authors", JSON.stringify(uniqAuthors));

  if (!bookTitle || authors.length === 0) {
    alert(`Потрібно заповнити обов'язкові поля: Назва книги та Автор`);
    return;
  }

  const fileInput = document.getElementById("img");
  if (fileInput.files[0]) {
    formData.append("book-img", fileInput.files[0]);
  }

  fetch(URL, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((response) => {
      console.log(`New book was added: ${response}`);
    })
    .catch((error) =>
      console.log(`Some error occurred while adding new book ${error}`),
    );

  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

function deleteBook(id) {
  const routHandler = "/deleteBook";
  const URL = BASE_URL + adminPath + apiVersion + routHandler;
  const request = JSON.stringify({ id: id });

  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: request,
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) =>
      console.log(`An error occurred while deleting book with id ${id}`),
    );

  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Обробка інпута файла

const fileInput = document.getElementById("img");
console.log(`FileInput: ${fileInput}`);
let file;

fileInput.addEventListener("change", (event) => {
  const target = event.target;

  file = target.files ? target.files[0] : null;

  if (!file) {
    console.log("File not added");
    return;
  }

  console.log(`File name: ${file.name}`);
  console.log(`File size: ${file.size} byte`);

  previewImg(file);
});

function previewImg(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = document.getElementById("img-preview");
    const placeholder = document.getElementById("placeholder");
    placeholder.style.display = "none";
    img.src = e.target.result;
    img.height = 170;
    img.style.display = "inline-block";
  };
  reader.readAsDataURL(file);
}

function logOut() {
  const routHandler = "/logout";
  const URL = BASE_URL + adminPath + apiVersion + routHandler;
  fetch(URL, {
    method: 'POST',
    credentials: "include"
  })
  .then(response => {
    if (!response.ok) throw new Error('Logout failed')
    return response.json()})
  .then(data => {
    if(data.ok){
      window.location.reload();
    }
  })
  .catch(err => console.log(`An error occurred: ${err}`))
}

function sendQuery(obj) {
  const defaultQuery = {
    offset: 0,
    search: "",
    author: "",
    year: "",
  };

  const finalQuery = { ...defaultQuery, ...obj };
  const params = new URLSearchParams(finalQuery);

  window.location.href = BASE_URL + adminPath + `/?${params.toString()}`;
}

const paginationArea = document.getElementById('pagination')
paginationArea.addEventListener('click', (e) => {
  const page = e.target.closest('[data-offset]')
  if (page){
    sendQuery({offset: page.dataset.offset})
  }
})