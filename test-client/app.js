console.log('Test app!');

function genDefinition() {
    document.getElementById('definition').value = '';
    const xhttp = new XMLHttpRequest();
    const str = document.getElementById('search').value;
    xhttp.open('POST', "https://api.grace-su.com/api/definitions", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({ word: str }));
    xhttp.onreadystatechange = function() {
        // to Lulu: you can react differently to different status codes, this is the template for you.
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('result').innerHTML = this.responseText;
            document.getElementById('definition').value = JSON.parse(this.responseText).definition;
        } else if (this.readyState == 4 && this.status == 404) {
            document.getElementById('result').innerHTML = this.responseText;
        } else if (this.readyState == 4 && this.status == 500) {
            document.getElementById('result').innerHTML = this.responseText;;
        } else {
            document.getElementById('result').innerHTML = "Error!";
        }
    };
}

function search() {
    
}

function store() {
    const xhttp = new XMLHttpRequest();
    const word = document.getElementById('search').value;
    const definition = document.getElementById('definition').value;
    xhttp.open('POST', "https://api.grace-su.com/api/definitions/add", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({ word, definition}));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('result').innerHTML = this.responseText;
        } else {
            document.getElementById('result').innerHTML = this.responseText;
        }
    };
}