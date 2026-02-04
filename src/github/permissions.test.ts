const contextMock: {
  actor: string;
  repo: { owner: string; repo: string };
  payload: {
    comment?: { author_association?: string };
    issue?: { author_association?: string };
    pull_request?: { author_association?: string };
  };
} = {
  actor: 'tester',
  repo: { owner: 'owner', repo: 'repo' },
  payload: {},
};

jest.mock('@actions/github', () => ({
  context: contextMock,
  getOctokit: jest.fn(),
}));

import { ensureTrustedAuthorAssociation } from './permissions';

describe('ensureTrustedAuthorAssociation', () => {
  beforeEach(() => {
    contextMock.payload = {};
  });

  it('returns when no author association is present', async () => {
    await expect(ensureTrustedAuthorAssociation()).resolves.toBeUndefined();
  });

  it('allows trusted author associations', async () => {
    contextMock.payload = { issue: { author_association: 'OWNER' } };

    await expect(ensureTrustedAuthorAssociation()).resolves.toBeUndefined();
  });

  it('rejects untrusted author associations', async () => {
    contextMock.payload = { comment: { author_association: 'CONTRIBUTOR' } };

    await expect(ensureTrustedAuthorAssociation()).rejects.toThrow(
      "Author association on owner/repo must be OWNER, MEMBER, or COLLABORATOR. Detected: 'CONTRIBUTOR'.",
    );
  });
});
