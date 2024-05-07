// Variables
var button = document.getElementById('signupBtn');
var usernameInput = document.getElementById('usernameInput')
var passwordInput = document.getElementById('passwordInput')

// Requires
//const fetch = require('fetch')

function onButtonClicked() {
  let username = usernameInput.value
  let password = passwordInput.value

  fetch('/v1/login', {
    method: "POST",
    headers: {
      'username': username,
      'password': password
    }

  })
}
button.addEventListener('click', onButtonClicked)
