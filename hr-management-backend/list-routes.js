// Simple test to check if routes are registered
const app = require('./src/app');

console.log('Registered routes:');
console.log('==================');

function printRoutes(stack, basePath = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods.padEnd(10)} ${basePath}${layer.route.path}`);
    } else if (layer.name === 'router') {
      const path = layer.regexp.source
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\^/g, '')
        .replace(/\$/g, '');
      
      if (layer.handle.stack) {
        printRoutes(layer.handle.stack, basePath + path);
      }
    }
  });
}

printRoutes(app._router.stack);
