const fs = require('fs');
const path = require('path');

// Config
const distDir = path.resolve('dist');
const templatePath = path.resolve('template.html');
const outputHtml = path.join(distDir, 'index.html');
const minifiedScript = 'yo.min.js';

// Ensure dist folder exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Check if template exists
if (!fs.existsSync(templatePath)) {
  console.error(`❌ Template not found: ${templatePath}`);
  console.error('Please create template.html with the HTML structure.');
  process.exit(1);
}

// Read template
let html = fs.readFileSync(templatePath, 'utf-8');

// Simple placeholder replacement
// You can add more placeholders later (title, version, etc.)
html = html.replace('YOUR_MINIFIED_SCRIPT', minifiedScript);

if (!html.includes(minifiedScript)) {
  console.warn('⚠️  Warning: "YOUR_MINIFIED_SCRIPT" placeholder not found in template.');
}

// Write final file
fs.writeFileSync(outputHtml, html);

console.log(`✅ Test page generated: ${outputHtml}`);