export class BytesSize {
  public calculate(data: object) {
    let size: number = 0;

    return this.traverse(data, size);
  }

  public verifySize(receivedData: object, receivedSize: number) {
    let expectedSize: number = 0;

    this.traverse(receivedData, expectedSize);

    if (expectedSize === receivedSize) {
      return true;
    }

    return false;
  }

  private traverse(data: any, size: number) {
    for (const key in data) {
      if (typeof data[key] === "object") {
        this.traverse(data[key], size);
      } else {
        size += Buffer.from(JSON.stringify(data[key])).length;
      }
    }

    return size;
  }
}
