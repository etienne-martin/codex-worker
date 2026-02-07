let githubTokenMock = 'workflow-token';
let githubTokenActorMock: string | undefined;

jest.mock('./input', () => ({
  inputs: {
    get githubToken() {
      return githubTokenMock;
    },
    get githubTokenActor() {
      return githubTokenActorMock;
    },
  },
}));

import { resolveTokenActor, WORKFLOW_TOKEN_ACTOR } from './identity';

describe('resolveTokenActor', () => {
  const originalToken = process.env.GITHUB_TOKEN;

  afterEach(() => {
    process.env.GITHUB_TOKEN = originalToken;
    githubTokenMock = 'workflow-token';
    githubTokenActorMock = undefined;
  });

  it('returns the workflow token actor when using GITHUB_TOKEN', async () => {
    process.env.GITHUB_TOKEN = 'workflow-token';

    await expect(resolveTokenActor()).resolves.toBe(WORKFLOW_TOKEN_ACTOR);
  });

  it('returns the provided token actor when supplied', async () => {
    process.env.GITHUB_TOKEN = 'workflow-token';
    githubTokenActorMock = 'sudden-agent[bot]';

    await expect(resolveTokenActor()).resolves.toBe('sudden-agent[bot]');
  });

  it('throws when token actor is missing for non-workflow tokens', async () => {
    process.env.GITHUB_TOKEN = 'workflow-token';
    githubTokenMock = 'other-token';

    await expect(resolveTokenActor()).rejects.toThrow(
      'Missing github_token_actor input for non-workflow GitHub tokens.',
    );
  });
});
