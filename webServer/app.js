var express = require('express');
var routes = require('./routes');
var app = express();

function OpenWebServer() {
    app.locals.pagetitle = "NodeJS ";
    app.set('view engine', 'ejs');

    app.use(express.static(__dirname + '/public/css'));
    app.use(express.static(__dirname + '/public/js'));

    app.get('/', routes.index);
    app.get('/deviceMap', routes.deviceMap);
    app.get('/showTH', routes.showTH);
    app.get('/test', function(req, res) {
        res.status(200).json({success: "GET lists"});
    });

    var server = app.listen(3000, function() {
      console.log('Open Web Server on port 3000');
    }); 
}

exports.OpenWebServer = function( ) {
    OpenWebServer();
}

OpenWebServer();

/*
app.post('/test2', function(req, res) {
    console.log( "pppp" );
    res.status(200).json( {success: "POST lists"} );
});

app.put('*', function(req, res) {
    console.log( "put" );
    res.status(200).json( {success: "XXXX"} );
});

app.delete('*', function(req, res) {
    console.log( "delete" );
    res.status(200).json( {success: "XXXX"} );
});

app.post('/login', function(req, res) {
    console.log( "pppp" );
    res.status(200).json( {success: "POST lists"} );
});

/*app.get('*', function(req, res) {
  res.send('沒有東西噢');
});
*/