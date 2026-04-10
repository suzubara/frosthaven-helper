export interface EvalCase {
  input: string
  expectedTools: string[]
  category: string
}

export const EVAL_CASES: EvalCase[] = [
  // ─── Campaign Management ──────────────────────────────────────────────

  // list_campaigns
  { input: 'show my campaigns', expectedTools: ['list_campaigns'], category: 'campaign-management' },
  { input: 'what campaigns do I have', expectedTools: ['list_campaigns'], category: 'campaign-management' },
  { input: 'list campaigns', expectedTools: ['list_campaigns'], category: 'campaign-management' },
  { input: 'which campaigns exist', expectedTools: ['list_campaigns'], category: 'campaign-management' },

  // create_campaign
  { input: 'create a new campaign called Frostgate', expectedTools: ['create_campaign'], category: 'campaign-management' },
  { input: 'start a new campaign', expectedTools: ['create_campaign'], category: 'campaign-management' },
  { input: 'make a campaign named The Long Winter', expectedTools: ['create_campaign'], category: 'campaign-management' },
  { input: 'new campaign Icebound', expectedTools: ['create_campaign'], category: 'campaign-management' },

  // load_campaign
  { input: 'load campaign Frostgate', expectedTools: ['load_campaign'], category: 'campaign-management' },
  { input: 'open the Frostgate campaign', expectedTools: ['load_campaign'], category: 'campaign-management' },
  { input: 'switch to campaign Icebound', expectedTools: ['load_campaign'], category: 'campaign-management' },
  { input: 'load Frostgate', expectedTools: ['load_campaign'], category: 'campaign-management' },

  // get_campaign_status
  { input: 'show campaign status', expectedTools: ['get_campaign_status'], category: 'campaign-management' },
  { input: 'how is the campaign going', expectedTools: ['get_campaign_status'], category: 'campaign-management' },
  { input: 'campaign overview', expectedTools: ['get_campaign_status'], category: 'campaign-management' },
  { input: "what's the campaign state", expectedTools: ['get_campaign_status'], category: 'campaign-management' },
  { input: 'give me a summary of the campaign', expectedTools: ['get_campaign_status'], category: 'campaign-management' },

  // update_resource
  { input: 'add 3 lumber', expectedTools: ['update_resource'], category: 'campaign-management' },
  { input: 'we got 2 metal', expectedTools: ['update_resource'], category: 'campaign-management' },
  { input: 'remove 1 hide', expectedTools: ['update_resource'], category: 'campaign-management' },
  { input: 'gained 5 rockroot', expectedTools: ['update_resource'], category: 'campaign-management' },
  { input: 'spend 2 lumber on building', expectedTools: ['update_resource'], category: 'campaign-management' },

  // update_morale
  { input: 'increase morale by 2', expectedTools: ['update_morale'], category: 'campaign-management' },
  { input: 'morale goes up 1', expectedTools: ['update_morale'], category: 'campaign-management' },
  { input: 'lose 3 morale', expectedTools: ['update_morale'], category: 'campaign-management' },
  { input: 'morale dropped by 2', expectedTools: ['update_morale'], category: 'campaign-management' },

  // update_prosperity
  { input: 'add 2 prosperity', expectedTools: ['update_prosperity'], category: 'campaign-management' },
  { input: 'gained a prosperity checkmark', expectedTools: ['update_prosperity'], category: 'campaign-management' },
  { input: 'prosperity goes up by 1', expectedTools: ['update_prosperity'], category: 'campaign-management' },
  { input: 'we earned some prosperity, add 3', expectedTools: ['update_prosperity'], category: 'campaign-management' },

  // update_defense
  { input: 'increase defense by 3', expectedTools: ['update_defense'], category: 'campaign-management' },
  { input: 'defense goes up 2', expectedTools: ['update_defense'], category: 'campaign-management' },
  { input: 'lose 1 defense', expectedTools: ['update_defense'], category: 'campaign-management' },
  { input: 'defense dropped to 4', expectedTools: ['update_defense'], category: 'campaign-management' },

  // update_soldiers
  { input: 'add 2 soldiers', expectedTools: ['update_soldiers'], category: 'campaign-management' },
  { input: 'recruit 3 soldiers', expectedTools: ['update_soldiers'], category: 'campaign-management' },
  { input: 'lost a soldier', expectedTools: ['update_soldiers'], category: 'campaign-management' },
  { input: 'we hired 2 more soldiers for Frosthaven', expectedTools: ['update_soldiers'], category: 'campaign-management' },

  // update_inspiration
  { input: 'gain 1 inspiration', expectedTools: ['update_inspiration'], category: 'campaign-management' },
  { input: 'add 2 inspiration', expectedTools: ['update_inspiration'], category: 'campaign-management' },
  { input: 'lost inspiration', expectedTools: ['update_inspiration'], category: 'campaign-management' },
  { input: 'inspiration went down by 1', expectedTools: ['update_inspiration'], category: 'campaign-management' },

  // mark_week
  { input: 'mark a week', expectedTools: ['mark_week'], category: 'campaign-management' },
  { input: 'advance the calendar', expectedTools: ['mark_week'], category: 'campaign-management' },
  { input: 'week passes', expectedTools: ['mark_week'], category: 'campaign-management' },
  { input: 'mark off a week', expectedTools: ['mark_week'], category: 'campaign-management' },
  { input: 'another week gone', expectedTools: ['mark_week'], category: 'campaign-management' },

  // add_building
  { input: 'build the Craftsman', expectedTools: ['add_building'], category: 'campaign-management' },
  { input: 'add the Alchemist building', expectedTools: ['add_building'], category: 'campaign-management' },
  { input: 'unlock the Barracks', expectedTools: ['add_building'], category: 'campaign-management' },
  { input: 'we constructed the Trading Post', expectedTools: ['add_building'], category: 'campaign-management' },

  // upgrade_building
  { input: 'upgrade the Craftsman', expectedTools: ['upgrade_building'], category: 'campaign-management' },
  { input: 'level up the Alchemist', expectedTools: ['upgrade_building'], category: 'campaign-management' },
  { input: 'upgrade Barracks to level 2', expectedTools: ['upgrade_building'], category: 'campaign-management' },
  { input: 'the Craftsman gets an upgrade', expectedTools: ['upgrade_building'], category: 'campaign-management' },

  // add_character
  { input: 'add a new character named Suz class Drifter', expectedTools: ['add_character'], category: 'campaign-management' },
  { input: 'Suz joins as a level 1 Drifter with 10 HP', expectedTools: ['add_character'], category: 'campaign-management' },
  { input: 'create character Joah, Blinkblade, level 1, 8 HP', expectedTools: ['add_character'], category: 'campaign-management' },
  { input: 'new character AJ playing a Boneshaper at level 1 with 6 HP', expectedTools: ['add_character'], category: 'campaign-management' },

  // update_character
  { input: 'level up Suz to level 3', expectedTools: ['update_character'], category: 'campaign-management' },
  { input: "update Joah's HP to 8", expectedTools: ['update_character'], category: 'campaign-management' },
  { input: 'Suz is now level 2', expectedTools: ['update_character'], category: 'campaign-management' },
  { input: "change AJ's max HP to 7", expectedTools: ['update_character'], category: 'campaign-management' },

  // retire_character
  { input: 'retire Suz', expectedTools: ['retire_character'], category: 'campaign-management' },
  { input: 'Suz retires', expectedTools: ['retire_character'], category: 'campaign-management' },
  { input: 'remove Suz from the party permanently', expectedTools: ['retire_character'], category: 'campaign-management' },
  { input: 'Joah has completed their personal quest and retires', expectedTools: ['retire_character'], category: 'campaign-management' },

  // update_notes
  { input: 'update notes to we unlocked envelope A', expectedTools: ['update_notes'], category: 'campaign-management' },
  { input: 'add to campaign notes: found the secret passage', expectedTools: ['update_notes'], category: 'campaign-management' },
  { input: 'write down that we promised to help the Algox', expectedTools: ['update_notes'], category: 'campaign-management' },
  { input: 'note: chose to spare the merchant', expectedTools: ['update_notes'], category: 'campaign-management' },

  // ─── Scenario Management ──────────────────────────────────────────────

  // start_scenario
  { input: 'start scenario 1', expectedTools: ['start_scenario'], category: 'scenario-management' },
  { input: 'begin scenario 5', expectedTools: ['start_scenario'], category: 'scenario-management' },
  { input: "let's play scenario 3", expectedTools: ['start_scenario'], category: 'scenario-management' },
  { input: 'kick off scenario 12', expectedTools: ['start_scenario'], category: 'scenario-management' },

  // end_scenario
  { input: 'end the scenario', expectedTools: ['end_scenario'], category: 'scenario-management' },
  { input: 'scenario is over', expectedTools: ['end_scenario'], category: 'scenario-management' },
  { input: "we're done with this scenario", expectedTools: ['end_scenario'], category: 'scenario-management' },
  { input: 'finish the scenario, we won', expectedTools: ['end_scenario'], category: 'scenario-management' },

  // get_scenario_status
  { input: 'show scenario status', expectedTools: ['get_scenario_status'], category: 'scenario-management' },
  { input: "what's happening in the scenario", expectedTools: ['get_scenario_status'], category: 'scenario-management' },
  { input: 'scenario overview', expectedTools: ['get_scenario_status'], category: 'scenario-management' },
  { input: 'where are we in the scenario', expectedTools: ['get_scenario_status'], category: 'scenario-management' },

  // advance_round
  { input: 'next round', expectedTools: ['advance_round'], category: 'scenario-management' },
  { input: 'advance the round', expectedTools: ['advance_round'], category: 'scenario-management' },
  { input: 'new round', expectedTools: ['advance_round'], category: 'scenario-management' },
  { input: 'round ends', expectedTools: ['advance_round'], category: 'scenario-management' },

  // set_element
  { input: 'infuse fire', expectedTools: ['set_element'], category: 'scenario-management' },
  { input: 'fire is strong', expectedTools: ['set_element'], category: 'scenario-management' },
  { input: 'set ice to waning', expectedTools: ['set_element'], category: 'scenario-management' },
  { input: 'earth goes to strong', expectedTools: ['set_element'], category: 'scenario-management' },
  { input: 'consume the dark element', expectedTools: ['set_element'], category: 'scenario-management' },

  // add_monster_group
  { input: 'add living bones with 5 normal HP and 7 elite HP', expectedTools: ['add_monster_group'], category: 'scenario-management' },
  { input: 'new monster group: guards', expectedTools: ['add_monster_group'], category: 'scenario-management' },
  { input: 'spawn a group of night demons, 4 normal HP, 6 elite HP', expectedTools: ['add_monster_group'], category: 'scenario-management' },
  { input: 'add a frost demon monster group with 6 normal and 9 elite HP', expectedTools: ['add_monster_group'], category: 'scenario-management' },

  // add_standee
  { input: 'add normal standee #1 to living bones', expectedTools: ['add_standee'], category: 'scenario-management' },
  { input: 'place elite #3', expectedTools: ['add_standee'], category: 'scenario-management' },
  { input: 'spawn normal living bones #2', expectedTools: ['add_standee'], category: 'scenario-management' },
  { input: 'add elite guard standee number 4', expectedTools: ['add_standee'], category: 'scenario-management' },

  // damage_entity
  { input: 'Suz takes 3 damage', expectedTools: ['damage_entity'], category: 'scenario-management' },
  { input: 'hit living bones #1 for 4', expectedTools: ['damage_entity'], category: 'scenario-management' },
  { input: 'deal 2 damage to Joah', expectedTools: ['damage_entity'], category: 'scenario-management' },
  { input: 'frost demon #2 takes 5 damage', expectedTools: ['damage_entity'], category: 'scenario-management' },
  { input: 'attack guard #1 for 3', expectedTools: ['damage_entity'], category: 'scenario-management' },

  // heal_entity
  { input: 'heal Suz for 3', expectedTools: ['heal_entity'], category: 'scenario-management' },
  { input: 'Joah recovers 2 HP', expectedTools: ['heal_entity'], category: 'scenario-management' },
  { input: 'living bones #1 heals 1', expectedTools: ['heal_entity'], category: 'scenario-management' },
  { input: 'restore 4 HP to AJ', expectedTools: ['heal_entity'], category: 'scenario-management' },

  // toggle_condition
  { input: 'poison Suz', expectedTools: ['toggle_condition'], category: 'scenario-management' },
  { input: 'stun living bones #3', expectedTools: ['toggle_condition'], category: 'scenario-management' },
  { input: 'remove wound from Joah', expectedTools: ['toggle_condition'], category: 'scenario-management' },
  { input: 'muddle the guard #1', expectedTools: ['toggle_condition'], category: 'scenario-management' },
  { input: 'apply immobilize to frost demon #2', expectedTools: ['toggle_condition'], category: 'scenario-management' },

  // kill_standee
  { input: 'kill living bones #1', expectedTools: ['kill_standee'], category: 'scenario-management' },
  { input: 'living bones #2 dies', expectedTools: ['kill_standee'], category: 'scenario-management' },
  { input: 'destroy guard #3', expectedTools: ['kill_standee'], category: 'scenario-management' },
  { input: 'frost demon #1 is dead', expectedTools: ['kill_standee'], category: 'scenario-management' },

  // set_initiative
  { input: 'Suz has initiative 15', expectedTools: ['set_initiative'], category: 'scenario-management' },
  { input: 'set living bones initiative to 45', expectedTools: ['set_initiative'], category: 'scenario-management' },
  { input: 'Joah goes at 30', expectedTools: ['set_initiative'], category: 'scenario-management' },
  { input: 'living bones drew 72', expectedTools: ['set_initiative'], category: 'scenario-management' },

  // next_turn
  { input: 'next turn', expectedTools: ['next_turn'], category: 'scenario-management' },
  { input: 'end turn', expectedTools: ['next_turn'], category: 'scenario-management' },
  { input: 'whose turn is it next', expectedTools: ['next_turn'], category: 'scenario-management' },
  { input: "done with this turn, who's next", expectedTools: ['next_turn'], category: 'scenario-management' },

  // get_turn_order
  { input: 'show turn order', expectedTools: ['get_turn_order'], category: 'scenario-management' },
  { input: "what's the initiative order", expectedTools: ['get_turn_order'], category: 'scenario-management' },
  { input: 'who goes next', expectedTools: ['get_turn_order'], category: 'scenario-management' },
  { input: 'show me the turn order for this round', expectedTools: ['get_turn_order'], category: 'scenario-management' },

  // update_xp
  { input: 'Suz gains 2 XP', expectedTools: ['update_xp'], category: 'scenario-management' },
  { input: 'add 1 XP to Joah', expectedTools: ['update_xp'], category: 'scenario-management' },
  { input: 'AJ earned 3 experience', expectedTools: ['update_xp'], category: 'scenario-management' },
  { input: 'Suz picked up an XP', expectedTools: ['update_xp'], category: 'scenario-management' },

  // ─── Multi-tool ────────────────────────────────────────────────────────

  {
    input: 'add 3 lumber and 2 metal',
    expectedTools: ['update_resource', 'update_resource'],
    category: 'multi-tool',
  },
  {
    input: 'Suz takes 4 damage and is poisoned',
    expectedTools: ['damage_entity', 'toggle_condition'],
    category: 'multi-tool',
  },
  {
    input: 'create campaign Frostgate and add Suz as a level 1 Drifter with 10 HP',
    expectedTools: ['create_campaign', 'add_character'],
    category: 'multi-tool',
  },
  {
    input: 'heal Joah for 3 and remove wound from Joah',
    expectedTools: ['heal_entity', 'toggle_condition'],
    category: 'multi-tool',
  },
  {
    input: 'kill living bones #1 and living bones #2',
    expectedTools: ['kill_standee', 'kill_standee'],
    category: 'multi-tool',
  },
  {
    input: 'Suz gains 2 XP and levels up to level 3',
    expectedTools: ['update_xp', 'update_character'],
    category: 'multi-tool',
  },
  {
    input: 'infuse fire and ice',
    expectedTools: ['set_element', 'set_element'],
    category: 'multi-tool',
  },
  {
    input: 'hit frost demon #1 for 5 and stun it',
    expectedTools: ['damage_entity', 'toggle_condition'],
    category: 'multi-tool',
  },
  {
    input: 'we gained 2 lumber, 1 metal, and 3 hide from this scenario',
    expectedTools: ['update_resource', 'update_resource', 'update_resource'],
    category: 'multi-tool',
  },
  {
    input: 'add 1 prosperity and increase morale by 2',
    expectedTools: ['update_prosperity', 'update_morale'],
    category: 'multi-tool',
  },

  // ─── Negative / Conversational ─────────────────────────────────────────

  { input: 'What is Frosthaven?', expectedTools: [], category: 'negative' },
  { input: 'How do conditions work?', expectedTools: [], category: 'negative' },
  { input: 'Thanks!', expectedTools: [], category: 'negative' },
  { input: 'What does poison do?', expectedTools: [], category: 'negative' },
  { input: 'Explain how elements work in this game', expectedTools: [], category: 'negative' },
  { input: 'How many scenarios are in Frosthaven?', expectedTools: [], category: 'negative' },
  { input: 'Good game everyone', expectedTools: [], category: 'negative' },
  { input: 'What level should we be for scenario 10?', expectedTools: [], category: 'negative' },
]
