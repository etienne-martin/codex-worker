import sodium from 'libsodium-wrappers';
import { context } from '@actions/github';
import { getOctokit } from './octokit';

export const encryptSecret = async (value: string, publicKey: string): Promise<string> => {
  await sodium.ready;

  return Buffer
    .from(sodium.crypto_box_seal(Buffer.from(value, 'utf8'), Buffer.from(publicKey, 'base64')))
    .toString('base64');
};

export const updateRepoSecret = async (name: string, value: string): Promise<void> => {
  const { owner, repo } = context.repo;
  const octokit = getOctokit();
  const { data } = await octokit.rest.actions.getRepoPublicKey({ owner, repo });

  await octokit.rest.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: name,
    encrypted_value: await encryptSecret(value, data.key),
    key_id: data.key_id,
  });
};
