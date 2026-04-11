import { RULE_REGEX } from "../Constants.ts";
import { Rule, ruleGroups, stylizedRuleNames } from "../core/Rules.ts";

export type RuleKey = keyof typeof Rule;

export function isValidRule(rule: string): boolean {
  return RULE_REGEX.test(rule);
}

export function parseRule(rule: string): [boolean[], boolean[]] {
  const halves = rule.split("/");

  const birthTable = Array.from({ length: 8 }, () => false);
  const survivalTable = Array.from({ length: 8 }, () => false);

  halves[0]
    .substring(1)
    .split("")
    .map((s) => parseInt(s, 10))
    // oxlint-disable-next-line unicorn/no-array-for-each
    .forEach((index) => (birthTable[index] = true));

  halves[1]
    .substring(1)
    .split("")
    .map((s) => parseInt(s, 10))
    // oxlint-disable-next-line unicorn/no-array-for-each
    .forEach((index) => (survivalTable[index] = true));

  return [birthTable, survivalTable];
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
    return stylizedRuleNames[ruleValue];
  } else {
    return _convertToTitlecase(key);
  }
}

interface RuleGroupNamesAndValues {
  name: string;
  rules: [string, string][];
}

export function getRuleGroups(): RuleGroupNamesAndValues[] {
  return ruleGroups.map(({ name, rules }) => {
    return {
      name,
      rules: rules.map((ruleValue) => {
        const ruleKey = getRuleKeyByValue(ruleValue);
        const ruleName = getRuleNameByKey(ruleKey);

        return [ruleName, ruleValue];
      }),
    };
  });
}
