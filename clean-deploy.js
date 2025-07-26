#!/usr/bin/env node

console.log('🧹 开始清理部署环境...');

// 删除可能导致冲突的文件
const fs = require('fs');
const path = require('path');

const filesToClean = [
  'package-lock.json',
  'yarn.lock',
  '.netlify'
];

filesToClean.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`🗑️ 删除 ${file}`);
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  }
});

console.log('✅ 清理完成！');
console.log('💡 现在可以重新部署到 Netlify');