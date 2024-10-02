console.log('Test app!');

function search() {
    const xhttp = new XMLHttpRequest();
    const str = document.getElementById('search').value;
    xhttp.open('POST', "https://api.grace-su.com/api/definitions", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({ word: str }));
    xhttp.onreadystatechange = function() {
        // to Lulu: you can react differently to different status codes, this is the template for you.
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('result').innerHTML = this.responseText;
        } else if (this.readyState == 4 && this.status == 404) {
            document.getElementById('result').innerHTML = this.responseText;
        } else if (this.readyState == 4 && this.status == 500) {
            document.getElementById('result').innerHTML = this.responseText;;
        } else {
            document.getElementById('result').innerHTML = "Error!";
        }
    };
}