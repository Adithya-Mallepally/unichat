/**
 * icebreakers.js
 * ──────────────
 * Algorithmic conversation starter generator for paired anonymous chat sessions.
 */

const ICEBREAKER_PROMPTS = [
  "If you could travel anywhere tomorrow without worrying about budget, where would you go?",
  "What is the most underrated movie or TV series you have watched recently?",
  "Coffee, tea, or neither — and how do you take it?",
  "What is a hobby or skill you have always wanted to pick up?",
  "If you could have dinner with any historical figure, who would it be?",
  "What is your all-time favorite song to listen to on repeat?",
  "Are you more of an early morning person or a late night thinker?",
  "If you had to live in another decade, which one would you choose?"
];

function getRandomIcebreaker() {
  const index = Math.floor(Math.random() * ICEBREAKER_PROMPTS.length);
  return ICEBREAKER_PROMPTS[index];
}

module.exports = { getRandomIcebreaker, ICEBREAKER_PROMPTS };
