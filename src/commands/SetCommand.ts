import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { AttributeTransaction } from '../core/AttributeTransaction';

export class SetCommand extends AbstractCommand {
  public readonly name = 'set';
  public readonly description = 'set a shape attribute';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 3) {
      context.output.error('set requires id, attribute and value');
      return;
    }
    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const attribute = args[1];
    const value = args.slice(2).join(' ');
    const transaction = new AttributeTransaction();
    try {
      const handlers = context.attributes.matching(target, attribute);
      if (handlers.length > 1) {
        throw new Error(`conflicting attribute handlers: ${handlers.map(handler => handler.name).join(', ')}`);
      }
      if (handlers.length === 1) {
        const outcome = handlers[0].apply(target, attribute, value, transaction);
        context.recordAction(transaction.toHistoryAction(outcome.undoMessage, outcome.redoMessage));
        context.output.writeLine(outcome.executeMessage);
      } else {
        transaction.set(target, attribute, value);
        context.recordAction(transaction.toHistoryAction());
        context.output.writeLine(`${target.getDisplayName()} updated: ${attribute}=${value}`);
      }
    } catch (error) {
      transaction.rollback();
      context.output.error(error instanceof Error ? error.message : 'attribute handler failed');
    }
  }
}
