import fs from "fs";
import path from "path";

const PUBLIC_DIR = "./public";
const PATTERNS_DIR = "./public/patterns";
const PATTERNS_FILENAME = path.join(PUBLIC_DIR, "patterns.json");

const SUPPORTED_FILE_EXTENSIONS = [".lif"];

interface Pattern {
  name: string;
  path: string;
}

interface Category {
  name: string;
  patterns: Pattern[];
}

function getFileExtension(filename: string): string {
  let extension = path.extname(filename);

  if (extension === ".gz") {
    extension = path.extname(filename.slice(0, -3));
  }

  return extension;
}

const patternFiles = fs
  .readdirSync(PATTERNS_DIR, { withFileTypes: true, recursive: true })
  .filter((entry) => entry.isFile() && SUPPORTED_FILE_EXTENSIONS.includes(getFileExtension(entry.name)));

console.log(`Installing ${patternFiles.length} patterns...`);

const categories: Category[] = [];

for (const file of patternFiles) {
  const categoryName = file.parentPath.split(path.sep).slice(-1)[0];

  let category: Category | undefined = categories.find((category) => category.name === categoryName);

  if (!category) {
    category = {
      name: categoryName,
      patterns: [],
    };

    categories.push(category);
  }

  category.patterns.push({
    name: file.name,
    path: path.join("/patterns", categoryName, file.name),
  });
}

try {
  fs.writeFileSync(PATTERNS_FILENAME, JSON.stringify(categories));

  console.log("Done!");
} catch (e) {
  console.log("Error writing JSON file", e);
}
