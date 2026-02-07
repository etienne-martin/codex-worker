import { inputs } from './input';

export const WORKFLOW_TOKEN_ACTOR = 'github-actions[bot]';

export const resolveTokenActor = async (): Promise<string> => {
  if (inputs.githubTokenActor) return inputs.githubTokenActor;
  return WORKFLOW_TOKEN_ACTOR;
};
