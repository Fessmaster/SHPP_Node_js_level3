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

  for (const [key, value] of Object.entries(updates)){
    params.set(key, value)
  }
  if (!updates.offset){
    params.set('offset', 0)
  }
  const queryObject = Object.fromEntries(params.entries());
  sendQuery(queryObject);  

}


const searchField = document.getElementById("search");
searchField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();    
    const searchParam = searchField.value;

    updateParams({search: searchParam})

  }
});

//TODO Доробити !!!!!!!!

// function getQueryData (elem){
  
// }

const contentBlock = document.getElementById("content");
contentBlock.addEventListener("click", (e) => {
  const params = e.target.closest("[data-filter]");
  if (params){
    const filter = params.dataset.filter;
    const value = params.dataset.value;
    const query =    
    updateParams({
      [filter]: value
    })
  }

});

function getOffsetData(elem) {
  const offset = Number(elem.dataset.offset); 
  const params = new URLSearchParams(window.location.search);
  const currentOffset = Number(params.get("offset")) || 0;
  params.set("offset", currentOffset + offset);
  const queryObject = Object.fromEntries(params.entries());

  sendQuery(queryObject);
}

const pagination = document.getElementById("pagination");
pagination.addEventListener("click", (e) => {
  const arrowBack = e.target.closest(".arrow-back");
  if (arrowBack) {
    getOffsetData(arrowBack);
  }

  const arrowForward = e.target.closest(".arrow-forward");
  if (arrowForward) {
    getOffsetData(arrowForward)
  }
});
