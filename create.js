const fs = require('fs');
const path = require('path');

// Customize these if your filenames differ
const distDir = path.resolve('dist');
const minifiedScript = 'yo.min.js'; // Name of your minified output file
const htmlFile = path.join(distDir, 'index.html');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yo Hellow World Page</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.6; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 6px; }
  </style>
  <!-- Load your minified Yo script -->
  <script src="${minifiedScript}"></script>
</head>
<body>
  <h1>Yo - Test Page</h1>
  <p>This is a starter page to test your <code>Yo</code> script.</p>
  <p>Open the browser console (F12) to see output.</p>

  <hr>

  <h2>Your Custom Scripts can go here</h2>
  <script>
    var CompanyName = {};
    CompanyName.whatever = {};

    var YourYo = new Yo();
    YourYo.init({
      // defaults to Yo if not set.
      namespace: CompanyName.whatever,
      // defaults to 'module' if not set.  For example
      scriptRoot: 'scriptiesHere',
      // For dependencies you want available for all other scripts
      globalDependencies: {},
      // For outputting scripts Added, Loaded and dependency Connections, default: false
      //debugMode: true,
      // For outputting only logs by the scripts / keywords listed, case sensitive
      //debugScripts: ['scriptX', 'scriptY']
    });


    // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←
    // Write your test code below!
    // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←



    // Example test:
    console.log("YourYo: ", YourYo);
  </script>

</body>
</html>`;


// Ensure dist folder exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the HTML file (overwrite if exists – always fresh)
fs.writeFileSync(htmlFile, htmlContent.trim() + '\n');

console.log(`✅ Test page created: ${htmlFile}`);
console.log(`   Open it in your browser to test Yo interactively.`);