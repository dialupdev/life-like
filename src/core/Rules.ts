// https://en.wikipedia.org/wiki/Life-like_cellular_automaton
// https://conwaylife.com/wiki/List_of_Life-like_cellular_automata
// https://web.archive.org/web/20241126182351/https://www.mirekw.com/ca/rullex_life.html
// https://web.archive.org/web/20190218043733/http://fano.ics.uci.edu/ca/rules/list.html

export enum Rule {
  amoeba = "B357/S1358",
  assimilation = "B345/S4567",
  bacteria = "B34/S456",
  castles = "B3678/S135678",
  coagulations = "B378/S235678",
  coral = "B3/S45678",
  dayAndNight = "B3678/S34678",
  diamoeba = "B35678/S5678",
  dotLife = "B3/S023",
  dryLife = "B37/S23",
  flakes = "B3/S012345678",
  geology = "B3578/S24678",
  highLife = "B36/S23",
  holstein = "B35678/S4678",
  hTrees = "B1/S012345678",
  landRush = "B35/S234578",
  life = "B3/S23",
  longLife = "B345/S5",
  majority = "B45678/S5678",
  maze = "B3/S12345",
  mazectric = "B3/S1234",
  morley = "B368/S245",
  slowBlob = "B367/S125678",
  stains = "B3678/S235678",
  threeFourLife = "B34/S34",
  twoByTwo = "B36/S125",
  vote = "B5678/S45678",
  voteFourFive = "B4678/S35678",
}

export const stylizedRuleNames: Partial<Record<Rule, string>> = {
  [Rule.dayAndNight]: "Day & Night",
  [Rule.dotLife]: "DotLife",
  [Rule.dryLife]: "DryLife",
  [Rule.flakes]: "Flakes (Life without Death)",
  [Rule.highLife]: "HighLife",
  [Rule.hTrees]: "H-Trees",
  [Rule.morley]: "Morley (Move)",
  [Rule.threeFourLife]: "34 Life",
  [Rule.twoByTwo]: "2x2",
  [Rule.voteFourFive]: "Vote 4/5 (Anneal)",
};

export interface RuleGroup {
  name: string;
  rules: Rule[];
}

export const ruleGroups: RuleGroup[] = [
  {
    name: "Chaotic",
    rules: [
      Rule.amoeba,
      Rule.dayAndNight,
      Rule.dotLife,
      Rule.dryLife,
      Rule.geology,
      Rule.highLife,
      Rule.life,
      Rule.morley,
      Rule.twoByTwo,
    ],
  },
  {
    name: "Stable",
    rules: [
      Rule.assimilation,
      Rule.diamoeba,
      Rule.holstein,
      Rule.longLife,
      Rule.majority,
      Rule.stains,
      Rule.vote,
      Rule.voteFourFive,
    ],
  },
  {
    name: "Expanding",
    rules: [Rule.bacteria, Rule.castles, Rule.coral, Rule.slowBlob],
  },
  {
    name: "Exploding",
    rules: [Rule.coagulations, Rule.flakes, Rule.hTrees, Rule.landRush, Rule.maze, Rule.mazectric, Rule.threeFourLife],
  },
];
