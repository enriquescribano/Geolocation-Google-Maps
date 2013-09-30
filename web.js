var HTTP = require('http');
var URL  = require('url');
var QS   = require('querystring');
var FS   = require('fs');
var MIME = require('mime');

HTTP.createServer(function(request, response) {

  var VIEW = {
    render: function (file, r1) {
      FS.readFile(file, 'utf-8', function(err, data) {
        if (!err) {
          var data = data.replace(/<%r1%>/, r1);
          response.writeHead(200, {
            'Content-Type': 'text/html', 
            'Content-Length': data.length 
          }); 
          response.end(data);
        } else { VIEW.error(500, "Server operation Error_r"); };
      });
    },

    error: function(code,msg) { response.writeHead(code); response.end(msg);},
	
	file: function(file) {
      FS.readFile(file, function(err, data) {
        if (!err) {
          response.writeHead(200, { 
            'Content-Type': MIME.lookup(file), 
            'Content-Length': data.length 
          }); 
          response.end(data);
        } else { VIEW.error (500, file + " not found"); };
      });
    }
  }


  var CONTROLLER = {
  
    index: function () { VIEW.render ('index.html', "" );},
	
	file: function() { VIEW.file(url.pathname.slice(1)); }
  }


  var url       = URL.parse(request.url, true);
  var post_data = "";
  request.on('data', function (chunk) { post_data += chunk; });
  request.on('end', function() {

    post_data = QS.parse(post_data);

    // "question" variable global -> visible en controlador
    question  = (post_data.preg || url.query.preg);
    answer  = (post_data.answ || url.query.answ);
    var route = (post_data._method || request.method) + ' ' + url.pathname;  

    switch (route) {
      case 'GET /index'     : CONTROLLER.index()   ; break;
      default: {
        if (request.method == 'GET') CONTROLLER.file() ;
        else VIEW.error(400, "Unsupported request");
      }
    }
  });
}).listen(3000);