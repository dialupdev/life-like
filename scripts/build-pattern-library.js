import fs from "fs";
import path from "path";

const PUBLIC_DIR = "./public";
const PATTERNS_DIR = "./public/patterns";
const PATTERNS_FILENAME = path.join(PUBLIC_DIR, "patterns.json");

const SUPPORTED_FILE_EXTENSIONS = [".rle", ".gz"];

const patternFiles = fs
  .readdirSync(PATTERNS_DIR, { withFileTypes: true, recursive: true })
  .filter(entry => entry.isFile() && SUPPORTED_FILE_EXTENSIONS.includes(path.extname(entry.name)));

console.log(`Importing ${patternFiles.length} patterns...`);

const patterns = [];

for (const file of patternFiles) {
  const categoryName = file.path.split(path.sep).slice(-1)[0];

  let category = patterns.find(category => category.name === categoryName);

  if (!category) {
    category = {
      name: categoryName,
      patterns: [],
    };

    patterns.push(category);
  }

  category.patterns.push({
    name: file.name,
    path: path.join("/patterns", categoryName, file.name),
  });
}

try {
  fs.writeFileSync(PATTERNS_FILENAME, JSON.stringify(patterns));

  console.log("Done!");
} catch (e) {
  console.log("Error writing JSON file", e);
}
