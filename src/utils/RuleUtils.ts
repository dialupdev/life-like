import { Rule } from "../game/Rules";

export function parseRule(rule: Rule): [Set<number>, Set<number>] {
  const matches = rule.match(/B(\d*)\/S(\d*)/);

  if (!matches) {
    throw new Error(`Invalid Rule "${rule}"`);
  }

  const [_, birthString, survivalString] = matches;
  const birthSet = new Set(birthString.split("").map(s => parseInt(s, 10)));
  const survivalSet = new Set(survivalString.split("").map(s => parseInt(s, 10)));

  return [birthSet, survivalSet];
}
