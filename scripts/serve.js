'use strict';
// npm run serve: builds, then serves index.html and build/ statically on 127.0.0.1:38100 (contracts/build-and-serve.md).
const http = require('http');
const fs = require('fs');
const path = require('path');
const builder = require('./build.js');

const HOST = '127.0.0.1';
const PORT = 38100;
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

function resolve(urlPath) {
	const clean = path.posix.normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^\/+/, '');
	if (clean === '' || clean === 'index.html') { return path.join(root, 'index.html'); }
	if (clean.indexOf('..') >= 0) { return null; }
	// build/... as-is; templates (app/**/*.html) live under build/app/...
	return path.join(root, 'build', clean.replace(/^build\//, ''));
}

builder.build();
http.createServer(function (req, res) {
	const file = resolve(req.url);
	fs.readFile(file || '', function (err, data) {
		if (err || !file) { res.writeHead(404); res.end('not found'); return; }
		res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
		res.end(data);
	});
}).listen(PORT, HOST, function () { console.log('serving on http://' + HOST + ':' + PORT); });
