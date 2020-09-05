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
    } else if (fs.existsSync(path.join('.', req.url))) {
      res.writeHead(200, headers);
      var stream = fs.createReadStream(path.join('.', req.url));
      stream.on('open', () => {stream.pipe(res)});
      stream.on('error', (err) => res.end(err));
      // Do we need to close the stream? What's going on here?
      // res.end();
      next();
    } else {
      res.writeHead(404, headers);
      res.end();
      next();
    }
  } else {
    res.writeHead(200, headers);
    res.end();
    next();
  }

  // if (!fs.existsSync(path.join('.', req.url))) {
  //   res.writeHead(404, headers);
  //   res.end();
  //   next();
  // } else {
  //   ares.writeHead(200, headers);

  //   if (req.method === 'GET') {
  //     var message = messageQueue.dequeue();
  //     res.write(message ? message : '');
  //   }
  //   res.end();
  //   next();  // invoke next() at the end of a request to help with testing!
  // }
};
