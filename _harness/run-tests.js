/**
 * Runner harness: node apps/pabrik-aplikasi-gas/_harness/run-tests.js
 * Menemukan semua folder app di bawah apps/pabrik-aplikasi-gas/ (kecuali _*),
 * menjalankan tests/*.test.js masing-masing, laporan pass/fail per test.
 * Exit code 0 = semua hijau.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['_harness', '_blueprints']);

let totalPass = 0, totalFail = 0;
const failedApps = [];

for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory() || SKIP.has(entry.name)) continue;
  const testsDir = path.join(ROOT, entry.name, 'tests');
  if (!fs.existsSync(testsDir)) continue;

  for (const t of fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js'))) {
    // jalankan tiap test file di proses terpisah → isolation mock antar test
    const r = spawnSync(process.execPath, [path.join(testsDir, t)], { encoding: 'utf8' });
    const ok = r.status === 0;
    if (ok) { totalPass++; } else {
      totalFail++;
      failedApps.push(`${entry.name}/${t}`);
      console.error(`\n--- FAIL ${entry.name}/tests/${t} ---`);
      console.error(r.stdout);
      console.error(r.stderr);
    }
  }
}

console.log(`\n=== Pabrik GAS Harness: ${totalPass} passed, ${totalFail} failed ===`);
if (failedApps.length) {
  console.log('Gagal:', failedApps.join(', '));
  process.exit(1);
}
