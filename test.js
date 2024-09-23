const obj = {
  index: 0,
  timestamp: 1727079519709,
  prevBlockHash: "",
  hash: "0xxxf8f5cf64790bc353b31aca713c757826a4362f4797478c9971403690462524a6f",
  data: {
    transactions: {},
    blockHash:
      "0xxxf8f5cf64790bc353b31aca713c757826a4362f4797478c9971403690462524a6f",
  },
  verify: true,
  nonce: 0,
};

function calculateObjectSize(obj) {
  let size = 0;

  const item = {
    index: 0,
    timestamp: 1727079519709,
    prevBlockHash: "",
    hash: "0xxxf8f5cf64790bc353b31aca713c757826a4362f4797478c9971403690462524a6f",
    data: {
      transactions: {},
      blockHash:
        "0xxxf8f5cf64790bc353b31aca713c757826a4362f4797478c9971403690462524a6f",
    },
    verify: true,
    nonce: 0,
  };

  for (let i = 0; i < 2000; i++) {
    obj.data.transactions[i] = item;
  }

  function traverse(obj) {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        traverse(obj[key]);
      } else {
        size += Buffer.from(JSON.stringify(obj[key])).length;
      }
    }
  }

  traverse(obj);
  return size;
}

const sizeInBytes = calculateObjectSize(obj);
console.log("Размер объекта в байтах:", sizeInBytes);
