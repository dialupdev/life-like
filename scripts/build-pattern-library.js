import fs from "node:fs/promises";
import path from "path";

const PUBLIC_DIR = process.argv[2];
const PATTERNS_DIR = process.argv[3];
const PATTERNS_LIBRARY_FILENAME = path.join(PUBLIC_DIR, "patterns.json");

const nameRe = /^#[N|C] (.*)$/;

async function getName(filePath) {
  const file = await fs.open(filePath);

  for await (const line of file.readLines()) {
    const nameMatch = line.match(nameRe);

    file.close();

    return nameMatch ? nameMatch[1] : undefined;
  }
}

const allFileNames = await fs.readdir(PATTERNS_DIR);
const fileNames = allFileNames.filter(file => path.extname(file) === ".rle");

console.log(`Importing ${fileNames.length} RLE patterns...`);

const patterns = [];

for (let i = 0; i < fileNames.length; i++) {
  const fileName = fileNames[i];
  const filePath = path.join(PATTERNS_DIR, fileName);

  fs.copyFile(filePath, path.join(PATTERNS_DIR, fileName));

  const name = await getName(filePath);

  patterns.push({
    name,
    path: `/patterns/${fileName}`,
  });
}

const jsonData = {
  patterns,
};

try {
  await fs.writeFile(PATTERNS_LIBRARY_FILENAME, JSON.stringify(jsonData));
  console.log("Done!");
} catch (e) {
  console.log("Error writing JSON file", e);
}
