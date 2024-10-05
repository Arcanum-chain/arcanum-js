const defaultOp = (name: string) => {
  return { name, isAsync: false, dynamicGas: false };
};
const dynamicGasOp = (name: string) => {
  return { name, isAsync: false, dynamicGas: true };
};
const asyncOp = (name: string) => {
  return { name, isAsync: true, dynamicGas: false };
};
const asyncAndDynamicGasOp = (name: string) => {
  return { name, isAsync: true, dynamicGas: true };
};

const opcodes = {
  // 0x0 range - arithmetic ops
  // name, async
  0x00: defaultOp("STOP"),
  0x01: defaultOp("ADD"),
  0x02: defaultOp("MUL"),
  0x03: defaultOp("SUB"),
  0x04: defaultOp("DIV"),
  0x05: defaultOp("SDIV"),
  0x06: defaultOp("MOD"),
  0x07: defaultOp("SMOD"),
  0x08: defaultOp("ADDMOD"),
  0x09: defaultOp("MULMOD"),
  0x0a: dynamicGasOp("EXP"),
  0x0b: defaultOp("SIGNEXTEND"),

  // 0x10 range - bit ops
  0x10: defaultOp("LT"),
  0x11: defaultOp("GT"),
  0x12: defaultOp("SLT"),
  0x13: defaultOp("SGT"),
  0x14: defaultOp("EQ"),
  0x15: defaultOp("ISZERO"),
  0x16: defaultOp("AND"),
  0x17: defaultOp("OR"),
  0x18: defaultOp("XOR"),
  0x19: defaultOp("NOT"),
  0x1a: defaultOp("BYTE"),

  // 0x20 range - crypto
  0x20: dynamicGasOp("KECCAK256"),

  // 0x30 range - closure state
  0x30: asyncOp("ADDRESS"),
  0x31: asyncAndDynamicGasOp("BALANCE"),
  0x32: asyncOp("ORIGIN"),
  0x33: asyncOp("CALLER"),
  0x34: asyncOp("CALLVALUE"),
  0x35: asyncOp("CALLDATALOAD"),
  0x36: asyncOp("CALLDATASIZE"),
  0x37: asyncAndDynamicGasOp("CALLDATACOPY"),
  0x38: defaultOp("CODESIZE"),
  0x39: dynamicGasOp("CODECOPY"),
  0x3a: defaultOp("GASPRICE"),
  0x3b: asyncAndDynamicGasOp("EXTCODESIZE"),
  0x3c: asyncAndDynamicGasOp("EXTCODECOPY"),

  // '0x40' range - block operations
  0x40: asyncOp("BLOCKHASH"),
  0x41: asyncOp("COINBASE"),
  0x42: asyncOp("TIMESTAMP"),
  0x43: asyncOp("NUMBER"),
  0x44: asyncOp("DIFFICULTY"),
  0x45: asyncOp("GASLIMIT"),

  // 0x50 range - 'storage' and execution
  0x50: defaultOp("POP"),
  0x51: dynamicGasOp("MLOAD"),
  0x52: dynamicGasOp("MSTORE"),
  0x53: dynamicGasOp("MSTORE8"),
  0x54: asyncAndDynamicGasOp("SLOAD"),
  0x55: asyncAndDynamicGasOp("SSTORE"),
  0x56: defaultOp("JUMP"),
  0x57: defaultOp("JUMPI"),
  0x58: defaultOp("PC"),
  0x59: defaultOp("MSIZE"),
  0x5a: defaultOp("GAS"),
  0x5b: defaultOp("JUMPDEST"),

  // 0x60, range
  0x60: defaultOp("PUSH"),
  0x61: defaultOp("PUSH"),
  0x62: defaultOp("PUSH"),
  0x63: defaultOp("PUSH"),
  0x64: defaultOp("PUSH"),
  0x65: defaultOp("PUSH"),
  0x66: defaultOp("PUSH"),
  0x67: defaultOp("PUSH"),
  0x68: defaultOp("PUSH"),
  0x69: defaultOp("PUSH"),
  0x6a: defaultOp("PUSH"),
  0x6b: defaultOp("PUSH"),
  0x6c: defaultOp("PUSH"),
  0x6d: defaultOp("PUSH"),
  0x6e: defaultOp("PUSH"),
  0x6f: defaultOp("PUSH"),
  0x70: defaultOp("PUSH"),
  0x71: defaultOp("PUSH"),
  0x72: defaultOp("PUSH"),
  0x73: defaultOp("PUSH"),
  0x74: defaultOp("PUSH"),
  0x75: defaultOp("PUSH"),
  0x76: defaultOp("PUSH"),
  0x77: defaultOp("PUSH"),
  0x78: defaultOp("PUSH"),
  0x79: defaultOp("PUSH"),
  0x7a: defaultOp("PUSH"),
  0x7b: defaultOp("PUSH"),
  0x7c: defaultOp("PUSH"),
  0x7d: defaultOp("PUSH"),
  0x7e: defaultOp("PUSH"),
  0x7f: defaultOp("PUSH"),

  0x80: defaultOp("DUP"),
  0x81: defaultOp("DUP"),
  0x82: defaultOp("DUP"),
  0x83: defaultOp("DUP"),
  0x84: defaultOp("DUP"),
  0x85: defaultOp("DUP"),
  0x86: defaultOp("DUP"),
  0x87: defaultOp("DUP"),
  0x88: defaultOp("DUP"),
  0x89: defaultOp("DUP"),
  0x8a: defaultOp("DUP"),
  0x8b: defaultOp("DUP"),
  0x8c: defaultOp("DUP"),
  0x8d: defaultOp("DUP"),
  0x8e: defaultOp("DUP"),
  0x8f: defaultOp("DUP"),

  0x90: defaultOp("SWAP"),
  0x91: defaultOp("SWAP"),
  0x92: defaultOp("SWAP"),
  0x93: defaultOp("SWAP"),
  0x94: defaultOp("SWAP"),
  0x95: defaultOp("SWAP"),
  0x96: defaultOp("SWAP"),
  0x97: defaultOp("SWAP"),
  0x98: defaultOp("SWAP"),
  0x99: defaultOp("SWAP"),
  0x9a: defaultOp("SWAP"),
  0x9b: defaultOp("SWAP"),
  0x9c: defaultOp("SWAP"),
  0x9d: defaultOp("SWAP"),
  0x9e: defaultOp("SWAP"),
  0x9f: defaultOp("SWAP"),

  0xa0: dynamicGasOp("LOG"),
  0xa1: dynamicGasOp("LOG"),
  0xa2: dynamicGasOp("LOG"),
  0xa3: dynamicGasOp("LOG"),
  0xa4: dynamicGasOp("LOG"),

  // '0xf0' range - closures
  0xf0: asyncAndDynamicGasOp("CREATE"),
  0xf1: asyncAndDynamicGasOp("CALL"),
  0xf2: asyncAndDynamicGasOp("CALLCODE"),
  0xf3: dynamicGasOp("RETURN"),

  // '0x70', range - other
  0xfe: defaultOp("INVALID"),
  0xff: asyncAndDynamicGasOp("SELFDESTRUCT"),
};
