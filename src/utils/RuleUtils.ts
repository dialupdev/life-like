import { Rule } from "../core/Rules.ts";

export type RuleKey = keyof typeof Rule;

const stylizedRuleNames: Partial<Record<Rule, string>> = {
  [Rule.dayAndNight]: "Day & Night",
  [Rule.dotLife]: "DotLife",
  [Rule.dryLife]: "DryLife",
  [Rule.highLife]: "HighLife",
  [Rule.twoByTwo]: "2x2",
  [Rule.voteFourFive]: "Vote 4/5",
};

export function parseRule(rule: Rule): [Set<number>, Set<number>] {
  const halves = rule.split("/");

  const birthSet = new Set(
    halves[0]
      .substring(1)
      .split("")
      .map((s) => parseInt(s, 10))
  );
  const survivalSet = new Set(
    halves[1]
      .substring(1)
      .split("")
      .map((s) => parseInt(s, 10))
  );

  return [birthSet, survivalSet];
}

function _convertToTitlecase(key: RuleKey): string {
  const splitWords = key.replace(/([A-Z])/g, " $1");

  return splitWords.charAt(0).toUpperCase() + splitWords.slice(1);
}

export function getRuleKeyByValue(value: Rule): RuleKey {
  const ruleKeys = Object.keys(Rule) as RuleKey[];

  return ruleKeys.find((key) => Rule[key] === value)!;
}

function getRuleNameByKey(key: RuleKey): string {
  const ruleValue = Rule[key];

  if (stylizedRuleNames[ruleValue]) {
    return stylizedRuleNames[ruleValue]!;
  } else {
    return _convertToTitlecase(key);
  }
}

export function getAllRules(): [string, string][] {
  const ruleKeys = Object.keys(Rule) as RuleKey[];

  return ruleKeys.map((ruleKey) => {
    const ruleName = getRuleNameByKey(ruleKey);
    const ruleValue = Rule[ruleKey];

    return [ruleName, ruleValue];
  });
}
