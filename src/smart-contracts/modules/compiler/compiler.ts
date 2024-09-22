// @ts-expect-error
import solc from "solc";

export class SolidityCompiler {
  private readonly solc: solc;

  constructor() {
    this.solc = solc;
  }

  public compileContract(source: string) {
    const input = {
      language: "Solidity",
      sources: {
        "Contract.sol": {
          content: source,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
    };

    const output = JSON.parse(this.solc.compile(JSON.stringify(input)));
    return output.contracts["Contract.sol"];
  }
}
