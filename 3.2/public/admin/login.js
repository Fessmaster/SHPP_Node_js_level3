function handleLogin(){
  const login = document.getElementById('login')?.value;
  const password = document.getElementById('password')?.value;

  if(!login && !password){
    alert('Потрібно ввести логін та пароль.')
    return;
  }
  
  // coding login ad password before sending
  const authorizationCredential = btoa(`${login}:${password}`)
  
  const URL = 'http://localhost:3000/admin/api/v1/login'
  const request = JSON.stringify({login: login, password: password}) 

  fetch(URL, {
    method: 'POST',
    headers:{
      'Authorization': `Basic ${authorizationCredential}`
    } 
  })
  .then(res => res.json())
  .then(res => {
    if (res.ok){
      setTimeout(() => {window.location.reload()}, 500)
    } else {
      alert('Логін або пароль не вірний')
    }
  })

}