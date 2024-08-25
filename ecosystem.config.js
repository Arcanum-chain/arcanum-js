module.exports = {
  apps: [
    {
      name: "main",
      script: "dist/index.js",
      env: {
        WS_PORT: 6001,
        WS_CHILDS: [],
        PORT: 3000,
        IS_MAIN_NODE: true,
        WS_NODE_URL: "ws://localhost:6001",
        IS_THE_TEST_NODE: true,
      },
    },
    {
      name: "two",
      script: "dist/index.js",
      env: {
        WS_PORT: 6002,
        WS_CHILDS: [],
        PORT: 3001,
        IS_MAIN_NODE: false,
        WS_NODE_URL: "ws://localhost:6001",
        IS_THE_TEST_NODE: true,
      },
    },
    {
      name: "three",
      script: "dist/index.js",
      env: {
        WS_PORT: 6003,
        WS_CHILDS: [],
        PORT: 3002,
        IS_MAIN_NODE: false,
        WS_NODE_URL: "ws://localhost:6001",
        IS_THE_TEST_NODE: true,
      },
    },
  ],
};
