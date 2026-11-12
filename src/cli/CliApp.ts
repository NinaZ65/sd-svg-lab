import { ReplLoop } from './ReplLoop';
import { ConsoleOutput } from '../io/ConsoleOutput';
import { Assembly } from '../host/Assembly';
import { assembleCode } from '../host/CodeAssembly';
import { ConfigLoader } from '../host/ConfigLoader';

const output = new ConsoleOutput();
const args = process.argv.slice(2);
let assembly: Assembly;
if (args[0] === '--config') {
  assembly = new Assembly();
  if (args[1]) new ConfigLoader(assembly, output).load(args[1]);
  else output.error('invalid plugin config');
} else if (args[0] === '--no-plugins') {
  assembly = new Assembly();
} else {
  assembly = assembleCode();
}
const app = new ReplLoop(assembly, output);
app.run();
