const dgram = require("dgram");

// Настройки сети
const port = 11001; // Порт, на котором слушает сервер
// const host = "230.0.0.1"; // Адрес сервера (в данном случае localhost)
const host = "localhost";
// Создание UDP-соккета
const socket = dgram.createSocket("udp4");

// Отправка запроса на сервер
function sendRequest(message) {
  const buffer = Buffer.from(message);
  socket.send(buffer, 0, buffer.length, port, host, (err) => {
    if (err) {
      console.error("Ошибка при отправке запроса:", err);
    } else {
      console.log("Запрос отправлен!");
    }
  });
}

// Обработка ответа от сервера
socket.on("message", (message, remoteInfo) => {
  console.log(
    `Получен ответ: ${message.toString()}\nInfo: ${Object.values(
      remoteInfo
    ).join(",")}`
  );

  //   socket.send(
  //     Buffer.from(
  //       JSON.stringify({
  //         headers: {
  //           origin: "122.22.22.22:11002",
  //           nodeId: "ewdwdeew",
  //           timestamp: Date.now(),
  //         },
  //         payload: {
  //           type: "pong",
  //         },
  //       })
  //     ),
  //     remoteInfo.port,
  //     remoteInfo.address
  //   );
});

// Привязка сокета к случайному порту
socket.bind(port + 1, (err) => {
  if (err) {
    console.error("Ошибка привязки сокета:", err);
  } else {
    console.log("Socket address:", socket.address().address);
    console.log(`UDP-сокет привязан к порту: ${socket.address().port}`);
    sendRequest(
      JSON.stringify({
        headers: {
          nodeId: "234234234234",
          timestamp: Date.now(),
          origin: `${socket.address().address}:${socket.address().port}`,
          version: 0x16,
        },
        payload: {
          type: "ping",
          to: {
            nodeId: "23432442",
          },
          from: { tcpPort: 3432 },
        },
      })
    ); // Отправка запроса на сервер
  }
});

// Обработка ошибок
socket.on("error", (err) => {
  console.error("Ошибка UDP-соккета:", err);
});

// Закрытие сокета при завершении работы
process.on("SIGINT", () => {
  console.log("Завершение работы...");
  socket.close();
});
