var path = require('path');

function www(p) {
  return path.join(process.cwd(), 'www', p);
}

function app(p) {
  return path.join(process.cwd(), 'app', p);
}

module.exports = {
  DEBUG: true,
  
  wwwdir: www(''),
  appdir: app(''),
  
  appjs:    app('js/app.js'),
  appjsdir: app('js'), 
  wwwjs:    www('js/app.js'),
  wwwjsdir: www('js'),
  minjs:    www('js/app.js'),
    
  appIndexHtml:app('index.html'),
  wwwIndexHtml:www('index.html'), 
  
};

module.exports['bundle'] = [
  app('js/00requires.js'),
  module.exports.appjs
]