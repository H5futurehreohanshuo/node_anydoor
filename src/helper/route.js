const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');

const tplPath = path.join(__dirname, '../templates/dir.tpl');
const source = fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString());

module.exports = async function (req, res, filePath, config) {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      // 文件
      const contentType = mime(filePath);
      res.setHeader('Content-Type', `${contentType};charset=UTF-8`);
      // 判断是否需要使用缓存数据
      if (isFresh(stats, req, res)) {
        res.statusCode = 304;
        res.end();
        return;
      }
      let rs;
      const {code, start, end} = range(stats.size, req, res);
      // 推荐用流的方式读取文件
      if (code === 200) {
        res.statusCode = 200;
        rs = fs.createReadStream(filePath);
      } else {
        res.statusCode = 206;
        rs = fs.createReadStream(filePath, {start, end});
      }
      // 这样写也可以，但是不推荐，因为 readFile 需要把文件都读完才能执行回调函数，这样 read 的速度的是很慢的
      /* fs.readFile(filePath, (err, data) => {
        res.end(data);
      }); */
      // 开启 Gzip 压缩
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res);
      }
      rs.pipe(res);
    } else if (stats.isDirectory()) {
      // 文件夹
      const files = await readdir(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html;charset=UTF-8');
      const dir = path.relative(config.root, filePath);
      const data = {
        title: path.basename(filePath), // 文件名
        dir: dir ? `/${dir}` : '',
        files: files.map(file => {
          return {
            file,
            icon: mime(file)
          };
        })
      };
      res.end(template(data));
    }
  } catch (ex) {
    console.error(ex);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`${filePath} is not a directory or file\n ${ex.toString()}`);
  }
}
