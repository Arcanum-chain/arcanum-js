const { exec } = require("child_process");

const name = process.argv[2];

exec("pm2 -v", (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    installPm2()();
    return;
  }

  if (stderr) {
    console.log(stderr);
    installPm2()();
    return;
  }

  console.log(stdout);
  startNode()();
});

const installPm2 = () => {
  return () =>
    exec("npm i -g pm2", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      if (stderr) {
        console.log(stderr);
        return;
      }

      console.log(stdout);
    });
};

const startNode = () => {
  return () =>
    exec(
      `npm run build && pm2 start --name ${
        name ?? "node"
      } --namespace arcanum dist/index.js`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }

        if (stderr) {
          console.log(stderr);
          return;
        }

        console.log(stdout);
      }
    );
};

exec("pm2 monit node", (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }

  if (stderr) {
    console.log(stderr);
    return;
  }

  console.log(stdout);
});
