'use strict';

const fsPr = require('fs').promises;
const StaticServer = require('./StaticServer');

let server = new StaticServer();
//启动服务
// server.run();
//停止服务
// server.close();

let readdir = fsPr.readdir('./public');

function function_name(argument) {
	// body...
}

let pictures = new Array();

readdir.then(files=>{
	let file;
	for (let i = files.length - 1; i >= 0; i--) {
		file = files[i];
		fsPr.stat(`./public/${file}`).then(stats=>{
			console.log(files[i], stats.isDirectory(), stats.isFile());
		});
	}
}).catch(console.error);
