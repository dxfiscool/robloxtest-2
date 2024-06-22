// Variables
var button = document.getElementById('uploadBtn');
var fileInput = document.getElementById('formFile');


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

    fetch('/v1/upload-asset', {
        method: "POST",
        body: formData,
        headers: {
            'Cookie': document.cookie
        }
      })
}

button.addEventListener('click', onButtonClicked)
