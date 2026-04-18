// https://en.wikipedia.org/wiki/Life-like_cellular_automaton
// https://conwaylife.com/wiki/List_of_Life-like_cellular_automata
// https://mcell.ca/pages/rules.html
// https://web.archive.org/web/20241126182351/https://www.mirekw.com/ca/rullex_life.html
// https://web.archive.org/web/20190218043733/http://fano.ics.uci.edu/ca/rules/list.html

export enum Rule {
  amoeba = "B357/S1358",
  assimilation = "B345/S4567",
  bacteria = "B34/S456",
  blinkers = "B345/S2",
  bugs = "B3567/S15678",
  castles = "B3678/S135678",
  coagulations = "B378/S235678",
  coral = "B3/S45678",
  dayAndNight = "B3678/S34678",
  diamoeba = "B35678/S5678",
  dotLife = "B3/S023",
  dryLife = "B37/S23",
  flakes = "B3/S012345678",
  flock = "B3/S12",
  fuzz = "B1/S014567",
  geology = "B3578/S24678",
  gnarl = "B1/S1",
  highLife = "B36/S23",
  holstein = "B35678/S4678",
  hTrees = "B1/S012345678",
  iceballs = "B25678/S5678",
  inverseLife = "B0123478/S34678",
  landRush = "B35/S234578",
  life = "B3/S23",
  liveFreeOrDie = "B2/S0",
  longLife = "B345/S5",
  majority = "B45678/S5678",
  maze = "B3/S12345",
  mazectric = "B3/S1234",
  morley = "B368/S245",
  pseudoLife = "B357/S238",
  replicator = "B1357/S1357",
  ringsNSlugs = "B56/S14568",
  seeds = "B2/S",
  serviettes = "B234/S",
  slowBlob = "B367/S125678",
  snakeskin = "B1/S134567",
  stains = "B3678/S235678",
  starTrek = "B3/S0248",
  threeFourLife = "B34/S34",
  twoByTwo = "B36/S125",
  vote = "B5678/S45678",
  voteFourFive = "B4678/S35678",
  walledCities = "B45678/S2345",
  web = "B/S34567", // mine
}

export const stylizedRuleNames: Partial<Record<Rule, string>> = {
  [Rule.dayAndNight]: "Day & Night",
  [Rule.dotLife]: "DotLife",
  [Rule.dryLife]: "DryLife",
  [Rule.flakes]: "Flakes", // aka Life without Death
  [Rule.highLife]: "HighLife",
  [Rule.hTrees]: "H-Trees",
  [Rule.inverseLife]: "InverseLife",
  [Rule.life]: "Conway’s Life",
  [Rule.morley]: "Move", // aka Morley
  [Rule.ringsNSlugs]: "Rings 'n' Slugs",
  [Rule.threeFourLife]: "34 Life",
  [Rule.twoByTwo]: "2x2",
  [Rule.voteFourFive]: "Vote 4/5", // aka Anneal
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
      Rule.web,
    ],
  },
  {
    name: "Expanding",
    rules: [Rule.bacteria, Rule.castles, Rule.coral, Rule.slowBlob],
  },
  {
    name: "Exploding",
    rules: [
      Rule.coagulations,
      Rule.bugs,
      Rule.flakes,
      Rule.hTrees,
      Rule.landRush,
      Rule.maze,
      Rule.mazectric,
      Rule.threeFourLife,
    ],
  },
];
