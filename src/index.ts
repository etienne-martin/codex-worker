import { info, setFailed } from '@actions/core';
import { getAgent } from './agents';
import { postErrorComment } from './github/comment';
import { isIssueOrPullRequest } from './github/context';
import { githubMcpServer } from './github/mcp';
import { buildPrompt } from './prompt';
import { resolveTokenActor } from './github/identity';
import { fetchTrustedCollaborators, ensureWriteAccess, isTrustedCommentAuthor } from './github/security';
import { inputs } from './github/input';
import type { McpServerConfig } from './mcp';
import type { Agent } from './agent';

const teardown = async (agent: Agent, runSucceeded: boolean) => {
  await Promise.allSettled([
    githubMcpServer.stop(),
    agent.teardown({ runSucceeded }),
  ]);
};

const main = async () => {
  try {
    const mcpServers: McpServerConfig[] = [];

    const [trustedCollaborators, tokenActor, agent] = await Promise.all([
      fetchTrustedCollaborators(),
      resolveTokenActor(),
      getAgent(),
      ensureWriteAccess(),
    ]);

    if (!isTrustedCommentAuthor(trustedCollaborators)) {
      return info('Skipping run: comment author is not trusted.');
    }

    try {
      if (!inputs.sudo) {
        mcpServers.push(await githubMcpServer.start());
      }

      const { resumed } = await agent.bootstrap({
        mcpServers,
      });

      await agent.run(buildPrompt({ resumed, trustedCollaborators, tokenActor }));
      await teardown(agent, true);
    } catch (error) {
      await teardown(agent, false);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    setFailed(`sudden-agent failed: ${message}`);

    if (isIssueOrPullRequest()) {
      await postErrorComment();
    }
  }
};

void main();
