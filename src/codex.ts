import exec from '@actions/exec';
import type { ExecOptions } from '@actions/exec';

const CODEX_VERSION = "0.93.0";

const buildCommandError = (
  command: string,
  args: string[],
  stdout: string,
  stderr: string,
  exitCode: number,
): string => {
  const trimmedStdout = stdout.trim();
  const trimmedStderr = stderr.trim();
  const details = [trimmedStdout, trimmedStderr].filter(Boolean).join('\n');
  const base = `Command failed: ${[command, ...args].join(' ')}`;
  if (!details) {
    return `${base} (exit code ${exitCode})`;
  }
  return `${base}\n${details}`;
};

const runCommand = async (command: string, args: string[], options: ExecOptions = {}): Promise<void> => {
  const result = await exec.getExecOutput(command, args, { ...options, ignoreReturnCode: true });
  if (result.exitCode !== 0) {
    throw new Error(buildCommandError(command, args, result.stdout, result.stderr, result.exitCode));
  }
};

const install = async (version = CODEX_VERSION): Promise<void> => {
  await runCommand('npm', ['install', '-g', `@openai/codex@${version}`]);
};

const login = async (apiKey: string): Promise<void> => {
  await runCommand('bash', ['-lc', 'printenv OPENAI_API_KEY | codex login --with-api-key'], {
    env: { ...process.env, OPENAI_API_KEY: apiKey },
  });
};

export const bootstrapCli = async ({ version, apiKey }: { version?: string; apiKey: string }): Promise<void> => {
  await install(version);
  await login(apiKey);
};
