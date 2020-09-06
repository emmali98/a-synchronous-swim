const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const messageQueue = require('./messageQueue');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

// let messageQueue = null;
// module.exports.initialize = (queue) => {
//   messageQueue = queue;
// };

module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);

  if (req.method === 'GET') {
    if (req.url === '/') {
      res.writeHead(200, headers);
      var message = messageQueue.dequeue();
      res.write(message ? message : '');
      res.end();
      next();
    } else if (req.url === '/background.jpg') {
      fs.readFile(module.exports.backgroundImageFile, (err, data) => {
        if (err) {
          res.writeHead(404, headers);
        } else {
          res.writeHead(200, headers);
          res.write(data, 'binary');
        }
        res.end();
        next();
      })
      // res.writeHead(200, headers);
      // var imageStream = fs.createReadStream(path.join('.', req.url));
      // imageStream.on('open', () => imageStream.pipe(res));
      // imageStream.on('error', (err) => res.end(err));
      // imageStream.on('end', () => res.end());
      // next();
    } else {
      res.writeHead(404, headers);
      res.end();
      next();
    }
  } else if (req.method === 'POST') {
    // access a file path from req.url, and put the req.data in that path
    var imageData = Buffer.alloc(0);

    req.on('data', (chunk) => {
      imageData = Buffer.concat([imageData, chunk]);
    });

    req.on('end', () => {
      var file = multipart.getFile(imageData);
      fs.writeFile(module.exports.backgroundImageFile, file.data, (err) => {
        res.writeHead(err ? 400 : 201, headers);
        res.end();
        next();
      })
    })
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    next();
  }
};
