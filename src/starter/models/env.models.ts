export const EnvConfigModelKeys: Record<string, EnvProto> = {
  PORT: {
    required: true,
    type: "number",
    key: "PORT",
  },
  WS_PORT: {
    required: true,
    type: "number",
    key: "WS_PORT",
  },
  IS_MAIN_NODE: {
    required: false,
    type: "boolean",
    key: "IS_MAIN_NODE",
  },
  WS_NODE_URL: {
    required: true,
    type: "string",
    key: "WS_NODE_URL",
  },
  IS_THE_TEST_NODE: {
    required: true,
    type: "boolean",
    key: "IS_THE_TEST_NODE",
  },
};

export interface KeyEnvsObj {
  PORT: number;
  WS_PORT: number;
  IS_MAIN_NODE?: boolean;
  WS_NODE_URL: string;
  IS_THE_TEST_NODE: boolean;
}

export interface EnvProto {
  required: boolean;
  type: "number" | "string" | "boolean" | "symbol" | "object" | "bigint";
  key: string;
}
