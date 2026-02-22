const BASE_URL = `/`;

function orderBook(id) {
  fetch(BASE_URL + "books/order/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.status === "ok") {
        const bookTitle = document.getElementById('title').innerHTML;
        $('#modalMessageBody')
        .text(`Книга "${bookTitle}" вільна і ти можеш прийти за нею. Наша адреса м.Кропивницький, пров.Василівський 10, 5 поверх. Краще попередньо зателефонувати і домовитись, щоб не втрапити в незручну ситуацію. 
Тел. 097 123 45 67`);
        $('#model-order').modal('show');

        console.log(`Книгу замовлено!`);
      }
    })
    .catch((err) => {
      console.log(`Some error while ordering book - ${err}`);
    });
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

  window.location.href = `/?${params.toString()}`;
}

function updateParams(updates) {
  const params = new URLSearchParams(window.location.search);

  for (const [key, value] of Object.entries(updates)) {
    params.set(key, value);
  }
  if (!updates.offset) {
    params.set("offset", 0);
  }
  const queryObject = Object.fromEntries(params.entries());
  sendQuery(queryObject);
}

const searchField = document.getElementById("search");
searchField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const searchParam = searchField.value;
    updateParams({ search: searchParam });
  }
});

const contentBlock = document.getElementById("content");
contentBlock.addEventListener("click", (e) => {
  const params = e.target.closest("[data-filter]");
  if (params) {
    const filter = params.dataset.filter;
    const value = params.dataset.value;
    const query = updateParams({
      [filter]: value,
    });
  }
  const order = e.target.closest("[data-order]");
  if (order) {
    const id = order.dataset.order;
    orderBook(id);
  }
});