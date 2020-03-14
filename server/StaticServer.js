'use strict';
//引入模块
const http = require('http');
const fs = require('fs');
const url = require('url');
const mime = require('mime');//用于处理文件的Content-Type，通过npm安装

//创建并导出StaticServer类
module.exports = class StaticServer {
    //构造函数
    //初始化自动调用
    constructor(options) {
        this.currentServer = null;      //http对象
        this.options = {
            port: 8000,                 //服务器动的端口
            host: '127.0.0.1',          //服务器启动的ip
            filePath: './public',       //静态文件根目录
            homePage: '/index.html'     //指定首页文件
        };
        //把传入构造函数的参数中的值加入到options中
        for (let key in options) {
            this.options[key] = options[key];
        }
    }
    //服务器启动函数
    run() {
        let self = this;
        this.currentServer = http.createServer((req, res) => {
            let tmpUrl = url.parse(req.url).pathname;//解析客户端请求访问的url地址
            let reqUrl = tmpUrl === '/'? self.options.homePage:tmpUrl //如果用户访问的是'/'首页，则自动指定读取首页文件，默认是'index.html'
            console.log(reqUrl);
            let filePath = self.options.filePath + reqUrl;//组装文件地址
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
            console.log('Server is running on' + this.options.host + ':' + this.options.port);
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