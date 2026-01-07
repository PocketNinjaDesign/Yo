const { minify } = require('@swc/core');
const fs = require('fs');
const path = require('path');

// Customize these paths
const inputFile = 'yo.js';      // Your source JS file
const outputFile = 'dist/yo.min.js'; // Output minified file

const code = fs.readFileSync(path.resolve(inputFile), 'utf8');

minify(code, {
  compress: true,   // Enable dead code elimination, inlining, etc.
  mangle: true,     // Shorten variable/property names
  // Optional tweaks (compatible with Terser-style options)
  // sourceMap: true, // Generate a .map file if needed
  // module: true,    // Treat as ES module
}).then(result => {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, result.code);

  if (result.map) {
    fs.writeFileSync(outputFile + '.map', result.map);
  }

  console.log(`Minified ${inputFile} → ${outputFile}`);
}).catch(err => {
  console.error('Minification failed:', err);
  process.exit(1);
});