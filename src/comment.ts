import { getInput } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import { getIssueNumber } from './github-context';

export const postComment = async (message: string): Promise<void> => {
  const issueNumber = getIssueNumber();
  if (!issueNumber) {
    return;
  }
  const { owner, repo } = context.repo;
  const githubToken = getInput('github_token', { required: true });

  await getOctokit(githubToken).rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: message,
  });
};
