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

  const shellPath = process.env.SHELL || '/bin/sh';
  const shell = path.basename(shellPath);

  return {
    os: osName,
    shell,
    cwd: process.cwd(),
    home: process.env.HOME || os.homedir(),
    user: process.env.USER || os.userInfo().username,
  };
}
