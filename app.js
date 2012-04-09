var app = require('http').createServer(handler)
  , path = require('path')
  , fs = require('fs')
  , io = require('socket.io').listen(app)
  , nano = require('nano')('http://localhost:5984');

  nano.request({db:"_uuids"}, function(_,uuids){console.log(uuids); });
app.listen(3210);

function handler (req, res) {
    console.log('request for: '+req.url);
    var filePath='.'+req.url;
    if (filePath=='./')
        filePath='srv/index.html';
    var extname = path.extname(filePath);
    var contentType='text/html';
    switch (extname) {
        case '.js':
            contentType='text/javascript';
            break;
        case '.css':
            contentType='text/css';
            break;
    }
    path.exists(filePath, function(exists) {
        if(exists) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading filePath');
                }
                else {
                    res.writeHead(200,{'Content-Type':contentType});
                    res.end(data, 'utf-8');
                };
            });
        }
        else {
            res.writeHead(404);
            res.end();
        };
    });
};


io.sockets.on('connection', function (socket) {
    socket.emit('online',{foo:'ping'});
    socket.on('hexClicked', function (data) {
        console.log(data);
        socket.emit('ack', data);
    });
    socket.on('UIClicked', function(data) {
        console.log(data); 
    });
    socket.on('pong', function(data) {
        console.log("got pong:"+data);
    });
    socket.emit('activate', {'i':2,'j':3,'color':'#333333'});
});
