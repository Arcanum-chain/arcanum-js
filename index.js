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

    console.log(publicKeyWithHeaders);

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
    "MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgMnLNRySSTndYMdHsQ0LJrDOAsGZBO8w5I+tr+sU9kaqhRANCAARyNlvZyqbSq3pHNkZk03bkRJqAmKxUn5G1RkdlJA0nZjZkIwi2aopQiMbJ1EVqUwFSLuKfmtZHJQdWnG0kK4yZ";

  const transactionData = JSON.stringify({
    sender:
      "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEcjZb2cqm0qt6RzZGZNN25ESagJisVJ+RtUZHZSQNJ2Y2ZCMItmqKUIjGydRFalMBUi7in5rWRyUHVpxtJCuMmQ==",
    to: "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEL4wmzPezc+zI09vu4hz6QG/ArkP16xLEoW1GgPlb0WcVBbrwVzfJNOF0kDqVtY9IVmdUUPkMEbYY2gE+MtJwbQ==",
    amount: 5,
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
