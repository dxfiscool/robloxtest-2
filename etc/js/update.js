// Variables
var button = document.getElementById('updateBtn');
var fileInput = document.getElementById('formFile');
var textInput = document.getElementById('placeID')


// Functions
function onButtonClicked() {
    var file = fileInput.files[0];
    if (!file) {
        console.error('No file seleceted.');
        return;
    }

    var formData = new FormData();
    formData.append('file', file);
    formData.append('publicAsset', 'true')

    fetch('/v1/update-game', {
        method: "POST",
        body: formData,
        headers: {
            'Cookie': document.cookie,
            'PlaceID': textInput.value
        }
      })
}

button.addEventListener('click', onButtonClicked)
