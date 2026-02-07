type UserResponse = { data: { login: string } };

type AppResponse = { data: { slug?: string } };

type OctokitMock = {
  rest: {
    users: {
      getAuthenticated: jest.Mock<Promise<UserResponse>, []>;
    };
    apps: {
      getAuthenticated: jest.Mock<Promise<AppResponse>, []>;
    };
  };
};

const getAuthenticatedUserMock = jest.fn<Promise<UserResponse>, []>();
const getAuthenticatedAppMock = jest.fn<Promise<AppResponse>, []>();

const octokitMock: OctokitMock = {
  rest: {
    users: {
      getAuthenticated: getAuthenticatedUserMock,
    },
    apps: {
      getAuthenticated: getAuthenticatedAppMock,
    },
  },
};

jest.mock('./input', () => ({
  inputs: {
    githubToken: 'workflow-token',
  },
}));

jest.mock('./octokit', () => ({
  getOctokit: () => octokitMock,
}));

import { resolveTokenActor, WORKFLOW_TOKEN_ACTOR } from './identity';

describe('resolveTokenActor', () => {
  const originalToken = process.env.GITHUB_TOKEN;

  afterEach(() => {
    process.env.GITHUB_TOKEN = originalToken;
    getAuthenticatedUserMock.mockReset();
    getAuthenticatedAppMock.mockReset();
  });

  it('returns the workflow token actor when using GITHUB_TOKEN', async () => {
    process.env.GITHUB_TOKEN = 'workflow-token';

    await expect(resolveTokenActor()).resolves.toBe(WORKFLOW_TOKEN_ACTOR);
    expect(getAuthenticatedUserMock).not.toHaveBeenCalled();
    expect(getAuthenticatedAppMock).not.toHaveBeenCalled();
  });

  it('resolves the authenticated user login', async () => {
    process.env.GITHUB_TOKEN = 'other-token';
    getAuthenticatedUserMock.mockResolvedValue({ data: { login: 'octo' } });

    await expect(resolveTokenActor()).resolves.toBe('octo');
  });

  it('resolves the authenticated app slug when user lookup fails', async () => {
    process.env.GITHUB_TOKEN = 'other-token';
    getAuthenticatedUserMock.mockRejectedValue(new Error('no user'));
    getAuthenticatedAppMock.mockResolvedValue({ data: { slug: 'sudden-agent' } });

    await expect(resolveTokenActor()).resolves.toBe('sudden-agent[bot]');
  });

  it('throws when unable to resolve the token actor', async () => {
    process.env.GITHUB_TOKEN = 'other-token';
    getAuthenticatedUserMock.mockRejectedValue(new Error('no user'));
    getAuthenticatedAppMock.mockRejectedValue(new Error('no app'));

    await expect(resolveTokenActor()).rejects.toThrow('Failed to resolve token actor.');
  });
});
