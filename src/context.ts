import * as os from 'os';
import * as path from 'path';

export interface SystemContext {
  os: string;
  shell: string;
  cwd: string;
  home: string;
  user: string;
}

export function getSystemContext(): SystemContext {
  const platform = process.platform;
  let osName: string;
  switch (platform) {
    case 'darwin':
      osName = 'macOS';
      break;
    case 'linux':
      osName = 'Linux';
      break;
    case 'win32':
      osName = 'Windows';
      break;
    default:
      osName = platform;
  }

  let shell: string;
  if (platform === 'win32') {
    // Detect PowerShell vs cmd on Windows
    const comspec = process.env.COMSPEC || '';
    const psModulePath = process.env.PSModulePath || '';
    if (psModulePath || comspec.toLowerCase().includes('powershell')) {
      shell = 'PowerShell';
    } else {
      shell = 'cmd.exe';
    }
  } else {
    const shellPath = process.env.SHELL || '/bin/sh';
    shell = path.basename(shellPath);
  }

  return {
    os: osName,
    shell,
    cwd: process.cwd(),
    home: process.env.HOME || process.env.USERPROFILE || os.homedir(),
    user: process.env.USER || process.env.USERNAME || os.userInfo().username,
  };
}
