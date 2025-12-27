#!/usr/bin/env node

/**
 * Cloudflare 资源自动配置脚本
 * 自动创建 KV 命名空间和 D1 数据库，并更新 wrangler.toml
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    throw new Error(`命令执行失败: ${command}\n${error.message}`);
  }
}

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

async function main() {
  log('🚀 开始配置 Cloudflare 资源...', 'info');

  // 检查是否已登录
  try {
    exec('wrangler whoami');
    log('✓ 已登录 Cloudflare', 'success');
  } catch {
    log('请先登录 Cloudflare: wrangler login', 'error');
    process.exit(1);
  }

  const wranglerPath = join(__dirname, 'wrangler.toml');
  let wranglerContent = readFileSync(wranglerPath, 'utf-8');

  // 创建 KV 命名空间
  log('\n📦 创建 KV 命名空间...', 'info');
  try {
    const kvOutput = exec('wrangler kv namespace create KV');
    const kvIdMatch = kvOutput.match(/id = "([a-f0-9]+)"/);

    if (kvIdMatch) {
      const kvId = kvIdMatch[1];
      log(`✓ KV 命名空间创建成功: ${kvId}`, 'success');

      // 创建预览命名空间
      const kvPreviewOutput = exec('wrangler kv namespace create KV --preview');
      const kvPreviewIdMatch = kvPreviewOutput.match(/id = "([a-f0-9]+)"/);

      if (kvPreviewIdMatch) {
        const kvPreviewId = kvPreviewIdMatch[1];
        log(`✓ KV 预览命名空间创建成功: ${kvPreviewId}`, 'success');

        // 更新 wrangler.toml
        const kvConfig = `# KV namespace for sessions
[[kv_namespaces]]
binding = "KV"
id = "${kvId}"
preview_id = "${kvPreviewId}"`;

        if (wranglerContent.includes('[[kv_namespaces]]')) {
          wranglerContent = wranglerContent.replace(
            /# KV namespace.*?\n\[\[kv_namespaces\]\][\s\S]*?(?=\n\n|\n#|$)/,
            kvConfig
          );
        } else {
          wranglerContent += `\n\n${kvConfig}\n`;
        }
      }
    }
  } catch (error) {
    log(`⚠ KV 命名空间创建失败: ${error.message}`, 'warning');
    log('你可以稍后手动创建: wrangler kv namespace create KV', 'info');
  }

  // 创建 D1 数据库
  log('\n🗄️  创建 D1 数据库...', 'info');
  try {
    const d1Output = exec('wrangler d1 create storage_db');
    const d1IdMatch = d1Output.match(/database_id = "([a-f0-9-]+)"/);

    if (d1IdMatch) {
      const d1Id = d1IdMatch[1];
      log(`✓ D1 数据库创建成功: ${d1Id}`, 'success');

      // 更新 wrangler.toml
      const d1Config = `# D1 database for file metadata
[[d1_databases]]
binding = "DB"
database_name = "storage_db"
database_id = "${d1Id}"`;

      if (wranglerContent.includes('[[d1_databases]]')) {
        wranglerContent = wranglerContent.replace(
          /# D1 database.*?\n\[\[d1_databases\]\][\s\S]*?(?=\n\n|\n#|$)/,
          d1Config
        );
      } else {
        wranglerContent += `\n${d1Config}\n`;
      }

      // 保存配置
      writeFileSync(wranglerPath, wranglerContent);
      log('✓ wrangler.toml 已更新', 'success');

      // 初始化数据库
      log('\n📊 初始化数据库结构...', 'info');
      try {
        exec('wrangler d1 execute storage_db --file=schema.sql');
        log('✓ 数据库结构初始化成功', 'success');
      } catch (error) {
        log(`⚠ 数据库初始化失败: ${error.message}`, 'warning');
        log('你可以稍后手动初始化: wrangler d1 execute storage_db --file=schema.sql', 'info');
      }
    }
  } catch (error) {
    log(`⚠ D1 数据库创建失败: ${error.message}`, 'warning');
    log('你可以稍后手动创建: wrangler d1 create storage_db', 'info');
  }

  log('\n✨ 配置完成！', 'success');
  log('\n下一步:', 'info');
  log('  1. 运行 npm run dev 进行本地测试', 'info');
  log('  2. 运行 npm run deploy 部署到 Cloudflare Pages', 'info');
}

main().catch(error => {
  log(`\n❌ 错误: ${error.message}`, 'error');
  process.exit(1);
});
