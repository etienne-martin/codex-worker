import type { McpServerConfig } from './mcp';

export interface BootstrapOptions {
  mcpServers: McpServerConfig[]
}

export interface BootstrapResult {
  resumed: boolean
}

export interface TeardownOptions {
  runSucceeded: boolean
}

export interface Agent {
  bootstrap: (options: BootstrapOptions) => Promise<BootstrapResult>;
  run: (prompt: string) => Promise<void>;
  teardown: (options: TeardownOptions) => Promise<void>;
}
