var app = require('http').createServer(handler)
  , path = require('path')
  , fs = require('fs')
  , io = require('socket.io').listen(app);

app.listen(3210);

function handler (req, res) {
    console.log('request for: '+req.url);
    var filePath='.'+req.url;
    if (filePath=='./')
        filePath='./hexgrid.html';
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
//  socket.emit('news', { hello: 'world' });
//  socket.on('my other event', function (data) {
//    console.log(data);
//  });
    socket.emit('online',{foo:'ping'});
    socket.emit('activate', {'i':2,'j':3,'color':'#333333'});
    socket.on('hex clicked', function (data) {
        console.log(data);
        socket.emit('ack', data);
    });
    socket.on('pong', function(data) {
        console.log("got pong:"+data);
    });
});
