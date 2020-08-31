var path = require('path');
var net = require('net');
var fs = require('fs');

var dir = path.join(__dirname, 'public');

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

var server = net.createServer(function (con) {
    var input = '';
    con.on('data', function (data) {
        input += data;
        if (input.match(/\n\r?\n\r?/)) {
            var line = input.split(/\n/)[0].split(' ');
            var method = line[0],
                url = line[1],
                pro = line[2];
            var reqpath = url.toString().split('?')[0];
            if (method !== 'GET') {
                var body = 'Method not implemented';
                con.write('HTTP/1.1 501 Not Implemented\n');
                con.write('Content-Type: text/plain\n');
                con.write('Content-Length: ' + body.length + '\n\n');
                con.write(body);
                con.destroy();
                return;
            }
            var file = path.join(dir, reqpath.replace(/\/$/, '/index.html'));
            if (file.indexOf(dir + path.sep) !== 0) {
                var body = 'Forbidden';
                con.write('HTTP/1.1 403 Forbidden\n');
                con.write('Content-Type: text/plain\n');
                con.write('Content-Length: ' + body.length + '\n\n');
                con.write(body);
                con.destroy();
                return;
            }
            var type = mime[path.extname(file).slice(1)] || 'text/plain';
            var s = fs.readFile(file, function (err, data) {
                if (err) {
                    var body = 'Not Found';
                    con.write('HTTP/1.1 404 Not Found\n');
                    con.write('Content-Type: text/plain\n');
                    con.write('Content-Length: ' + body.length + '\n\n');
                    con.write(body);
                    con.destroy();
                } else {
                    con.write('HTTP/1.1 200 OK\n');
                    con.write('Content-Type: ' + type + '\n');
                    con.write('Content-Length: ' + data.byteLength + '\n\n');
                    con.write(data);
                    con.destroy();
                }
            });
        }
    });
});

server.listen(3000, function () {
    console.log('Listening on http://localhost:3000/');
});