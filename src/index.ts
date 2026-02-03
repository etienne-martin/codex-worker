import { setFailed } from '@actions/core';
import { bootstrapCli } from './codex';
import { postComment } from './comment';
import { readInputs } from './input';

const main = async (): Promise<void> => {
  try {
    const { cliVersion, apiKey } = readInputs();
    await bootstrapCli({ version: cliVersion, apiKey });
    throw new Error("Some error");
  } catch (error) {
    const message = `action-agent failed: ${error instanceof Error ? error.message : String(error)}`;

    setFailed(message);
    await postComment(message);
  }
};

void main();
