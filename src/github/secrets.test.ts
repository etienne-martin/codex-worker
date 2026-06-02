const contextMock = {
  repo: {
    owner: 'octo',
    repo: 'agent',
  },
};

const getRepoPublicKeyMock = jest.fn().mockResolvedValue({
  data: {
    key: Buffer.from('public-key').toString('base64'),
    key_id: 'key-id',
  },
});
const createOrUpdateRepoSecretMock = jest.fn().mockResolvedValue(undefined);

jest.mock('@actions/github', () => ({ context: contextMock }));

jest.mock('./octokit', () => ({
  getOctokit: () => ({
    rest: {
      actions: {
        getRepoPublicKey: getRepoPublicKeyMock,
        createOrUpdateRepoSecret: createOrUpdateRepoSecretMock,
      },
    },
  }),
}));

jest.mock('libsodium-wrappers', () => ({
  __esModule: true,
  default: {
    ready: Promise.resolve(),
    crypto_box_seal: jest.fn().mockReturnValue(Uint8Array.from([1, 2, 3])),
  },
}));

import sodium from 'libsodium-wrappers';
import { encryptSecret, updateRepoSecret } from './secrets';

const cryptoBoxSealMock = jest.mocked(sodium.crypto_box_seal);

describe('github secrets', () => {
  afterEach(() => {
    cryptoBoxSealMock.mockClear();
    getRepoPublicKeyMock.mockClear();
    createOrUpdateRepoSecretMock.mockClear();
  });

  describe('encryptSecret', () => {
    it('encrypts with the repo public key', async () => {
      const encrypted = await encryptSecret('secret-value', Buffer.from('public-key').toString('base64'));

      expect(encrypted).toBe(Buffer.from([1, 2, 3]).toString('base64'));
      expect(Buffer.from(cryptoBoxSealMock.mock.calls[0][0]).toString('utf8')).toBe('secret-value');
      expect(Buffer.from(cryptoBoxSealMock.mock.calls[0][1]).toString('utf8')).toBe('public-key');
    });
  });

  describe('updateRepoSecret', () => {
    it('updates a repo secret with encrypted value', async () => {
      await updateRepoSecret('CODEX_AUTH_JSON', 'secret-value');

      expect(getRepoPublicKeyMock).toHaveBeenCalledWith({
        owner: 'octo',
        repo: 'agent',
      });
      expect(createOrUpdateRepoSecretMock).toHaveBeenCalledWith({
        owner: 'octo',
        repo: 'agent',
        secret_name: 'CODEX_AUTH_JSON',
        encrypted_value: Buffer.from([1, 2, 3]).toString('base64'),
        key_id: 'key-id',
      });
    });
  });
});
