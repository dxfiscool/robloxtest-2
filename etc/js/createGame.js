// Variables
var button = document.getElementById('createBtn');

var gameNameInput = document.getElementById('gameNameInput')
var descriptionInput = document.getElementById('descriptionInput')

// Functions
function onButtonClicked() {
    let gameName = gameNameInput.value
    let description = descriptionInput.value

    fetch('/v1/create-game', {
        method: "POST",
        headers: {
            'Cookie': document.cookie,
            'GameName': gameName,
            'GameDescription': description
        }
      })
}

button.addEventListener('click', onButtonClicked)
