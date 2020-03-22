'use strict';
//引入模块
const http = require('http');
const fs = require('fs');
const fsPr = fs.promises;
const url = require('url');
const mime = require('mime');//用于处理文件的Content-Type，通过npm安装
const chokidar = require('chokidar');

let picList = new Array();
let unvisitedPicList = new Array();

let filePath = './public';

let watcher;

//创建StaticServer类
class StaticServer {
    //构造函数
    //初始化自动调用
    constructor(options) {
        this.currentServer = null;      //http对象
        this.options = {
            port: 8000,                 //服务器动的端口
            host: '127.0.0.1',          //服务器启动的ip
            filePath: filePath,       //静态文件根目录
        };
        //把传入构造函数的参数中的值加入到options中
        for (let key in options) {
            this.options[key] = options[key];
        }
    }

    setFile(file) {
        this.file = file;
    }

    //服务器启动函数
    run() {
        let self = this;
        this.currentServer = http.createServer((req, res) => {
            let tmpUrl = url.parse(req.url).pathname;//解析客户端请求访问的url地址
            let reqUrl;
            if(tmpUrl === '/randomPic')
                reqUrl = '/' + randomPic();
            else
                reqUrl = tmpUrl;
            let filePath = self.options.filePath + reqUrl;//组装文件地址
            // console.log(filePath);
            // console.log(picList);
            // console.log(unvisitedPicList);
            // Promise 支持链式调用
            // Promise 链式调用的条件是
            // 每个 then() 方法都 return 一个 Promise 对象
            // 后面才能跟着调用 then() 方法或者 catch() 方法
            // catch() 方法也要 return 一个 Promise 对象
            // 后面才能接着调用 then() 方法或者 catch() 方法
            //检测文件是否存在
            self.checkFilePromise(filePath).then(() => {
                return self.readFilePromise(filePath);// 文件存在则尝试读取文件
            }).then((data) => {
                self.sendData(res, data, reqUrl);//读取成功发送数据
            }).catch(() => {
                self.catch404(res);//读取失败
            });
        }).listen(this.options.port, this.options.host, () => {
            console.log(`Server is running on ${this.options.host}:${this.options.port}`);
        });
    }
    //关闭服务
    close() {
        this.currentServer.close(() => {
            console.log('Server closed.');
        });
    }
    //发送文件内容
    sendData(res, data, url) {
        res.writeHead(200, {'Content-Type': mime.getType(url) });
        res.write(data);
        res.end();
    }
    //捕获404错误
    catch404(res) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Error 404. Resource not found.');
        res.end();
    }
    //使用promise包读取文件的方法
    readFilePromise(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    // 使用 promise 包装见文件是否可读取的方法
    // fs.access 用于检测文件是否可读取
    checkFilePromise(path) {
        return new Promise((resolve, reject) => {
            fs.access(path, fs.R_OK, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve('success');
                }
            });
        });
    }
};

//最好每次请求都执行一遍，以免中途有文件增减
//或者监听文件夹
function getPicList() {
    fsPr.readdir(filePath).then(files=>{
        let postfix;
        for (let i = files.length - 1; i >= 0; i--) {
            fsPr.stat(`${filePath}/${files[i]}`).then(stats=>{
                if(!stats.isFile())
                    return;
                postfix = files[i].split('.').pop().toLowerCase();
                if(postfix === 'jpg' || postfix === 'png' || postfix === 'bmp' || postfix === 'jpeg'){
                    picList.push(files[i]);
                }
            });
        }
    }).catch(console.error);

    setTimeout(function() {
        console.log(picList);
    }, 1000);
}

function initWatcher() {
    watcher = chokidar.watch(filePath, {
        ignored: /[\/\\]\./,
        persistent: true,
        depth: 0
    });

    var log = console.log.bind(console);
/*    watcher
        .on('add', function(path) { log('File', path, 'has been added'); })
        .on('change', function(path) { log('File', path, 'has been changed'); })
        .on('unlink', function(path) { log('File', path, 'has been removed'); })
        .on('error', function(error) { log('Error happened', error); })
        .on('ready', function() { log('Initial scan complete. Ready for changes.'); })
        .on('raw', function(event, path, details) { log('Raw event info:', event, path, details); })*/
    watcher.on('add', path=>{
        log('File', path, 'has been added');
        let fileName = path.split('\\').pop();
        let postfix = fileName.split('.').pop().toLowerCase();
        if(postfix === 'jpg' || postfix === 'png' || postfix === 'bmp' || postfix === 'jpeg'){
            picList.push(fileName);
            unvisitedPicList.push(fileName);
            console.log(picList);
        }
    });
    watcher.on('unlink', path=>{
        log('File', path, 'has been removed');
        let fileName = path.split('\\').pop();
        let postfix = fileName.split('.').pop().toLowerCase();
        if(postfix === 'jpg' || postfix === 'png' || postfix === 'bmp' || postfix === 'jpeg'){
            picList.splice(picList.indexOf(fileName), 1);
            unvisitedPicList.splice(unvisitedPicList.indexOf(fileName), 1);
            console.log(picList);
        }
    });
    watcher.on('ready', ()=>{
        log('Initial scan complete. Ready for changes.');
        // console.log(picList);
    });
    watcher.on('error', error=>{
        log('Error happened', error);
    })
}

function randomPic() {
    if(unvisitedPicList.length === 0){
        for (let i = 0; i < picList.length; i++) {
            unvisitedPicList.push(picList[i]);
        }
    }

    // console.log("before", unvisitedPicList);
    let randomIndex = parseInt(Math.random() * unvisitedPicList.length);
    let result = unvisitedPicList[randomIndex];
    unvisitedPicList.splice(randomIndex, 1);
    // console.log("after", unvisitedPicList);
    return result;
}

// getPicList();
initWatcher();

let server = new StaticServer();
//启动服务
server.run();
//停止服务
// server.close();
