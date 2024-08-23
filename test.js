const crypto = require("crypto");
const fs = require("fs");

// 1. Генерация ключей
async function generateKeyPair() {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      "rsa",
      {
        modulusLength: 2048, // Длина модуля
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        } else {
          resolve({ publicKey, privateKey });
        }
      }
    );
  });
}

// 2. Сохранение ключей в файлы
async function saveKeys(publicKey, privateKey) {
  return new Promise((resolve, reject) => {
    fs.writeFile("public.pem", publicKey, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Публичный ключ сохранен в public.pem");
        fs.writeFile("private.pem", privateKey, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("Приватный ключ сохранен в private.pem");
            resolve();
          }
        });
      }
    });
  });
}

// 3. Загрузка ключей из файлов
async function loadKeys() {
  return new Promise((resolve, reject) => {
    fs.readFile("public.pem", "utf8", (err, publicKey) => {
      if (err) {
        reject(err);
      } else {
        fs.readFile("private.pem", "utf8", (err, privateKey) => {
          if (err) {
            reject(err);
          } else {
            resolve({ publicKey, privateKey });
          }
        });
      }
    });
  });
}

// 4. Шифрование данных
function encryptData(publicKey, data) {
  const dataEncrypt = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(data)
  );

  return dataEncrypt.toString("base64");
}

// 5. Дешифрование данных
async function decryptData(privateKey, encryptedData) {
  return new Promise((resolve, reject) => {
    const data = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedData, "base64")
    );

    resolve(data.toString("utf-8"));
  });
}

// Пример использования:
async function main() {
  try {
    // Генерация и сохранение ключей
    const { publicKey, privateKey } = await generateKeyPair();
    // await saveKeys(publicKey, privateKey);

    // Загрузка ключей из файлов
    // const { publicKey: loadedPublicKey, privateKey: loadedPrivateKey } =
    //   await loadKeys();

    const dataToEncrypt = "Секретная информация";
    const encryptedData = encryptData(publicKey, dataToEncrypt);
    console.log("Зашифрованные данные:", encryptedData);

    const decryptedData = await decryptData(privateKey, encryptedData);
    console.log("Расшифрованные данные:", decryptedData);

    // return decryptData;
  } catch (err) {
    console.error(err);
  }
}

main();
