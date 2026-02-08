const BASE_URL = "http://localhost:3000";

function sendQuery (obj) {
  const defaultQuery = {
    offset: 0,
    search: '',
    author: '',
    year: ''
  }

  const finalQuery = { ...defaultQuery, ...obj}
  const params = new URLSearchParams(finalQuery)  
  
  window.location.href = (BASE_URL + `/?${params.toString()}`)
}

function sendAuthorID (id){
  sendQuery({author: id})
}

function offset (count){  
  const queryString = window.location.search;  
  const params = new URLSearchParams(queryString);
  const currentOffset = Number(params.get('offset')) || 0;
  
  // save other query params  
  params.set('offset', currentOffset + count)
  const queryObject = Object.fromEntries(params.entries());
    
  sendQuery(queryObject);  
}