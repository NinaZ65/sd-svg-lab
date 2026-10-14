export class ConsoleOutput {
  public write(message: string): void {
    process.stdout.write(message);
  }

  public writeLine(message = ''): void {
    process.stdout.write(`${message}\n`);
  }

  public warning(message: string): void {
    this.writeLine(`warning: ${message}`);
  }

  public error(message: string): void {
    this.writeLine(`error: ${message}`);
  }
}
