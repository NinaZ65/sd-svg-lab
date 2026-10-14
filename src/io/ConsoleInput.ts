import readline from 'node:readline';

export class ConsoleInput {
  public static create(): readline.Interface {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
  }
}
