import { getInput } from '@actions/core';

interface Inputs {
  apiKey: string;
  githubToken: string;
  model: string;
  reasoningEffort: string;
}

export const readInputs = (): Inputs => ({
  apiKey: getInput('api_key', { required: true }),
  githubToken: getInput('github_token', { required: true }),
  model: getInput('model'),
  reasoningEffort: getInput('reasoning_effort'),
});
