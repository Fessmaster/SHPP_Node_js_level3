const BASE_URL = "http://localhost:3000";

function sendQuery(obj) {
  const defaultQuery = {
    offset: 0,
    search: "",
    author: "",
    year: "",
  };

  const finalQuery = { ...defaultQuery, ...obj };
  const params = new URLSearchParams(finalQuery);

  window.location.href = BASE_URL + `/?${params.toString()}`;
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

const pagination = document.getElementById("pagination");
pagination.addEventListener("click", (e) => {
  const arrow = e.target.closest("[data-offset]");
  if (arrow) {
    const currentOffset = new URLSearchParams(window.location.search).get(
      "offset",
    );
    const offset = arrow.dataset.offset;
    updateParams({ offset: Number(currentOffset) + Number(offset) });
  }
});
