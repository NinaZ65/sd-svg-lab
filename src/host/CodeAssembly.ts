import { Assembly } from './Assembly';

/** The sole code-composition root. New code-loaded plugins are added here. */
export function assembleCode(): Assembly {
  return new Assembly();
}
