const { minify } = require('@swc/core');
const fs = require('fs');
const path = require('path');

const inputFile = 'yo.js';
const outputPaths = ['yo.min.js', 'dist/yo.min.js'];

(async () => {
  const code = fs.readFileSync(inputFile, 'utf8');

  for (const outPath of outputPaths) {
    try {
      const result = await minify(code, {
        compress: true,
        mangle: true,
        // sourceMap: true,
      });

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, result.code);

      if (result.map) {
        fs.writeFileSync(outPath + '.map', result.map);
      }

      console.log(`Created → ${outPath}`);
    } catch (err) {
      console.error(`Failed: ${outPath}`, err);
      process.exit(1);
    }
  }

  console.log('Done! All minified versions created.');
})();