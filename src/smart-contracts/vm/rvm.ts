import { SolidityCompiler } from "../modules";

export class SmartContractsVm {
  private readonly compileService: SolidityCompiler;

  constructor() {
    this.compileService = new SolidityCompiler();
  }

  public deployContract(source: string) {
    const sources = this.compileService.compileContract(source);

    return sources;
  }
}
