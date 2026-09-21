const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const localWindowsFlutter = 'D:\\flutter\\bin\\flutter.bat';
const command = process.env.FLUTTER_BIN ||
  (process.platform === 'win32' && fs.existsSync(localWindowsFlutter) ? localWindowsFlutter : 'flutter');
const mode = process.argv[2] || 'test';
const executable = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : command;
const commandLine = command.includes(' ') ? `"${command}" ${mode}` : `${command} ${mode}`;
const args = process.platform === 'win32' ? ['/d', '/s', '/c', commandLine] : [mode];
const result = spawnSync(executable, args, {
  cwd: path.resolve(__dirname, '..', 'frontend'),
  stdio: 'inherit'
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
