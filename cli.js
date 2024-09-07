const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { exec } = require("node:child_process");

const commands = {
  hello: () => console.log("Hello, world!"),
  add: (a, b) =>
    console.log(`Sum of ${a} and ${b} is ${Number(a) + Number(b)}`),
  exit: () => process.exit(0),
  go: (file) => {
    exec(`node ${file}`, (err, stdout) => {
      if (err) {
        console.log(err);
      }

      console.log(stdout);
    });
  },
};

const handleInput = (input) => {
  const parts = input.trim().split(" ");
  const command = parts[0];
  const args = parts.slice(1);

  if (commands[command]) {
    commands[command](...args);
  } else {
    console.log("Invalid command.");
  }
};

const start = () => {
  console.log("Welcome to my CLI!");
  readline.question("> ", handleInput);
};

start();

readline.on("line", (input) => {
  handleInput(input);
  readline.question("> ", handleInput);
});
