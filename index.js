const crypto = require("crypto");
const { promisify } = require("util");
const EC = require("elliptic").ec;

// modulusLength: 1000, // Длина модуля (рекомендуется 2048 бит или больше)
// Функция для генерации пары ключей (publicKey, privateKey)

function addHeadersToKey(key, keyType) {
  if (!key) {
    return key;
  }

  return `-----BEGIN ${keyType}-----
${key}
-----END ${keyType}-----`;
}

async function generateKeyPair() {
  const generateKeyPairAsync = promisify(crypto.generateKeyPair);

  const { publicKey, privateKey } = await generateKeyPairAsync("ec", {
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
    namedCurve: "secp256k1",
  });

  // Удаление BEGIN/END строк из ключей
  const privateKeyWithoutHeaders = privateKey.replace(
    /-----BEGIN PRIVATE KEY-----|\n-----END PRIVATE KEY-----/g,
    ""
  );
  const publicKeyWithoutHeaders = publicKey.replace(
    /-----BEGIN PUBLIC KEY-----|\n-----END PUBLIC KEY-----/g,
    ""
  );

  // Преобразование ключей в Base64
  const privateKeyBase64 = privateKeyWithoutHeaders.replace(/\n/g, "");
  const publicKeyBase64 = publicKeyWithoutHeaders.replace(/\n/g, "");

  return { publicKey: publicKeyBase64, privateKey: privateKeyBase64 };
}

function signData(data, privateKey) {
  const privateKeyWithHeaders = addHeadersToKey(privateKey, "PRIVATE KEY");

  const signer = crypto.createSign("sha256");
  signer.update(data);
  signer.end();

  const signature = signer.sign(privateKeyWithHeaders, "base64");

  return signature.toString("base64");
}

function verifySignature(data, signature, publicKey) {
  try {
    const publicKeyWithHeaders = addHeadersToKey(publicKey, "PUBLIC KEY");

    const verifier = crypto.createVerify("sha256");
    verifier.update(data);
    verifier.end();

    const isValid = verifier.verify(
      publicKeyWithHeaders,
      Buffer.from(signature, "base64")
    );

    if (!isValid) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
}

// Пример использования

async function boostrap() {
  // const ec = new EC("secp256k1");
  const keyPair = await generateKeyPair();
  const privateKey =
    "MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQg/O8yVfQNVqGAQGBYjUhwgssloCXH5CQNFjuN5gAD2+ahRANCAAQb5zxdMNeeRlRF2Vq3oAcIsNaXcL8iSuBLb1WK/2yAsfkpsjf9BQEGMKjSIQ4oKvCuXi8GysYVuML1mGW9ZgnN";

  const transactionData = JSON.stringify({
    sender: "0xxxf9s3u5Yd1qTjUSgupL7NzzR7o9XbnH9Nnp",
    to: "0xxxf5rFkRWimSpF6TdULvuZnhxpa2DoZepM2q",
    amount: 2,
  });

  const signature = signData(transactionData, privateKey);
  // const isValid = verifySignature(
  //   transactionData,
  //   signature,
  //   keyPair.publicKey
  // );

  // console.log("PublicKey:", keyPair.publicKey);
  // console.log("PrivateKey:", keyPair.privateKey.toString("hex"));
  // console.log("Транзакция подписана:", isValid);
  console.log(signature);
}

boostrap();
const { generateKeyPairSync } = require("crypto");
const { keccak256 } = require("js-sha3");
const bs58 = require("bs58");

// Функция генерации адреса пользователя
function generateUserAddress() {
  // Генерация пары ключей
  const keyPair = generateKeyPairSync("ec", {
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
    namedCurve: "secp256k1",
  });

  // Извлечение открытого ключа
  const publicKey = keyPair.publicKey;

  // Хэширование открытого ключа с помощью SHA3-256 (KECCAK-256)
  const hash = keccak256(publicKey.toString("hex"));
  const sha512 = crypto
    .createHash("sha512")
    .update(publicKey.toString("hex"))
    .digest("hex");
  console.log("Keccak:", hash);
  console.log("Sha-512:", sha512);

  // Извлечение последних 20 байт хэша
  const addressBytes = hash.slice(-20);

  // Добавление 41 к началу массива байт
  addressBytes[0] += 41;

  // Дважды хэширование адреса с помощью SHA3-256
  const confirmationCode = Buffer(
    keccak256(keccak256(addressBytes)).slice(0, 4)
  );

  // Добавление кода подтверждения в конец адреса
  const fullAddress = Buffer.concat([Buffer(addressBytes), confirmationCode]);

  const encodedAddress = bs58.default.encode(fullAddress);

  // Добавление префикса "T"
  const networkAddress = `0xfff${encodedAddress}`;

  return networkAddress;
}

// Пример использования
// const address = generateUserAddress();
// console.log("Адрес пользователя:", address); // Вывод адреса пользователя

// T6DPGjzG3Ujkzve3YQqVVbteXAr8AfBeYi
// TLWYdRYbhH39jFjJZhHgbq9N3t68EXPQNG
