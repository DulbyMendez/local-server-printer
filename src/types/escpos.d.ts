declare module 'escpos' {
  export class Printer {
    constructor(device: any);
    text(content: string): this;
    feed(lines?: number): this;
    cut(): this;
    close(): void;
  }
}

declare module 'escpos-network' {
  class Network {
    constructor(ip: string, port: number);
    open(callback: (error?: Error) => void): void;
  }
  export = Network;
} 