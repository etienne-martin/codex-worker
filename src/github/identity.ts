import { inputs } from './input';

export const WORKFLOW_TOKEN_ACTOR = 'github-actions[bot]';

const isWorkflowToken = (): boolean => {
  const workflowToken = process.env.GITHUB_TOKEN;
  return Boolean(workflowToken && workflowToken === inputs.githubToken);
};

export const resolveTokenActor = async (): Promise<string> => {
  if (inputs.githubTokenActor) return inputs.githubTokenActor;
  if (isWorkflowToken()) return WORKFLOW_TOKEN_ACTOR;

  throw new Error('Missing github_token_actor input for non-workflow GitHub tokens.');
};
