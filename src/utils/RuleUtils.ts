import { RULE_REGEX } from "../Constants.ts";
import { Rule, ruleGroups, stylizedRuleNames } from "../core/Rules.ts";

export type RuleKey = keyof typeof Rule;

export function isValidRule(rule: string): boolean {
  return RULE_REGEX.test(rule);
}

export function isNamedRule(rule: string): boolean {
  return Object.values(Rule).includes(rule as Rule);
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

function _getRuleKeyByValue(value: Rule): RuleKey {
  const ruleKeys = Object.keys(Rule) as RuleKey[];

  return ruleKeys.find((key) => Rule[key] === value)!;
}

function _ruleKeyAsTitlecase(value: Rule): string {
  const key = _getRuleKeyByValue(value);
  const splitWords = key.replace(/([A-Z])/g, " $1");

  return splitWords.charAt(0).toUpperCase() + splitWords.slice(1);
}

export function getRuleNameByValue(value: Rule): string {
  if (stylizedRuleNames[value]) {
    return stylizedRuleNames[value];
  } else {
    return _ruleKeyAsTitlecase(value);
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
        const ruleName = getRuleNameByValue(ruleValue);

        return [ruleName, ruleValue];
      }),
    };
  });
}
