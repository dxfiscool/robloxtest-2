// Variables
var button = document.getElementById('signupBtn');
var usernameInput = document.getElementById('usernameInput')
var passwordInput = document.getElementById('passwordInput')

// Requires
//const fetch = require('fetch')

// Functions
function createError(message) {
  var divBody = document.querySelector('.card-body')

  var newDiv = document.createElement('div')

  newDiv.className = 'alertDiv';

  newDiv.innerHTML = `
    <div class="alert alert-danger" role="alert">
      ${message}
    </div>

    `
  var firstThing = divBody.firstChild

  divBody.insertBefore(newDiv, firstThing)
}

function onButtonClicked() {
  let username = usernameInput.value
  let password = passwordInput.value

  let usernameRegex = /^[a-zA-Z0-9_]+$/
  let passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~`\-=/\\|'" ]+$/

  if (!usernameRegex.test(username)) {
    createError('Usernames cannot contain any spaces or special characters.')
    return
  }

  if (!passwordRegex.test(password)) {
    createError('Usernames cannot contain any spaces or special characters.')
    return
  }

  if (!username.length > 2 && !username.length < 21) {
    createError('Usernames must be 3 to 20 characters long.')
    return
  }

   if (password.length > 7 && password.length < 129) {
     fetch('/v1/register', {
       method: "POST",
       headers: {
         'username': username,
         'password': password
       }
     })
   } else {
     createError('Passwords must be 8 to 120 characters long.')
   }


}

button.addEventListener('click', onButtonClicked)
