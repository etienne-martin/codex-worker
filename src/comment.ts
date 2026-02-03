import { context, getOctokit } from '@actions/github';
import { getIssueNumber } from './context';
import { inputs } from './input';
import { isPermissionError } from './permissions';

export const postComment = async (message: string): Promise<void> => {
  const { owner, repo } = context.repo;

  try {
    await getOctokit(inputs.githubToken).rest.issues.createComment({
      owner,
      repo,
      issue_number: getIssueNumber(),
      body: message,
    });
  } catch (error) {
    if (isPermissionError(error)) return;
    throw error;
  }
};
