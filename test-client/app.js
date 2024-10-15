console.log('Test app!');
const xhttp = new XMLHttpRequest();

function genDefinition() {
    document.getElementById('definition').value = '';
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
    document.getElementById('definition').value = '';
    const word = document.getElementById('search').value;
    xhttp.open('GET', `https://api.grace-su.com/api/definitions?word=${word}`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('result').innerHTML = this.responseText;
        } else {
            document.getElementById('result').innerHTML = this.responseText;
        }
    }
}

function store() {
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
    document.getElementById('search').value = '';
    document.getElementById('definition').value = '';
}

function addData() {
    console.log('addData');
    // xhttp.open('POST', "https://api.grace-su.com/api/db/add", true);
    xhttp.open('POST', "http://localhost:3000/api/db/add", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('dbResult').innerHTML = this.responseText;
        } else {
            document.getElementById('dbResult').innerHTML = this.responseText;
        }
    };
}

function submitQuery() {
    const query = document.getElementById('query').value.trim();

    // check if the query has INSERT or SELECT
    if (query.toUpperCase().includes('INSERT')) {
        xhttp.open('POST', "https://api.grace-su.com/api/db/insert", true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify({ query }));
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById('dbResult').innerHTML = this.responseText;
            } else {
                document.getElementById('dbResult').innerHTML = this.responseText;
            }
        };
    } else if (query.toUpperCase().includes('SELECT')) {
        xhttp.open('GET', `https://api.grace-su.com/api/db/${query}`, true);
        xhttp.send();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById('dbResult').innerHTML = this.responseText;
            } else {
                document.getElementById('dbResult').innerHTML = this.responseText;
            }
        }
    } else {
        document.getElementById('dbResult').innerHTML = 'Invalid Query';
        return;
    }
}