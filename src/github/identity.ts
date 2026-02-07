import { inputs } from './input';
import { getOctokit } from './octokit';

export const WORKFLOW_TOKEN_ACTOR = 'github-actions[bot]';

const isWorkflowToken = (): boolean => {
  const workflowToken = process.env.GITHUB_TOKEN;
  return Boolean(workflowToken && workflowToken === inputs.githubToken);
};

const fetchTokenActor = async (): Promise<string> => {
  const octokit = getOctokit();

  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return data.login;
  } catch {
    // Fall through to app lookup.
  }

  try {
    const { data } = await octokit.rest.apps.getAuthenticated();
    if (data.slug) {
      return `${data.slug}[bot]`;
    }
  } catch {
    // Fall through to error.
  }

  throw new Error('Failed to resolve token actor.');
};

export const resolveTokenActor = async (): Promise<string> => {
  if (isWorkflowToken()) {
    return WORKFLOW_TOKEN_ACTOR;
  }

  return fetchTokenActor();
};
