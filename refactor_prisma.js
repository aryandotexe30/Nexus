const fs = require('fs');
const path = require('path');

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      fileList = findFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const allFiles = findFiles(path.join(__dirname, 'src'));

let changedCount = 0;

for (const file of allFiles) {
  if (file.replace(/\\/g, '/').includes('src/lib/prisma.ts')) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;

  const importRegex = /import\s*\{\s*PrismaClient\s*\}\s*from\s*["']@prisma\/client["'];?/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, 'import prisma from "@/lib/prisma";');
    hasChanges = true;
  }

  const initRegex = /const\s+prisma\s*=\s*new\s+PrismaClient\(\s*\)\s*;?/g;
  if (initRegex.test(content)) {
    content = content.replace(initRegex, '');
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    changedCount++;
  }
}

console.log(`Done. Updated ${changedCount} files.`);
