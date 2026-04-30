#!/usr/bin/env node

const API_URL = "http://127.0.0.1:3030/unlock";

const validRarities = [
  "common",
  "rare",
  "epic",
  "legendary",
  "platinum",
];

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) return null;

  return process.argv[index + 1] ?? null;
}

function showHelp() {
  console.log(`
Archivements CLI

Usage:
  node cli/index.js unlock --game "Pokemon Emerald" --achievement "Primera medalla" --rarity rare

Options:
  --game          Game title
  --achievement   Achievement title
  --description   Achievement description
  --rarity        common | rare | epic | legendary | platinum
`);
}

async function unlockAchievement() {
  const gameTitle = getArg("game");
  const achievementTitle = getArg("achievement");
  const description = getArg("description") ?? "";
  const rarity = getArg("rarity") ?? "common";

  if (!gameTitle || !achievementTitle) {
    console.error("Error: --game and --achievement are required.");
    showHelp();
    process.exit(1);
  }

  if (!validRarities.includes(rarity)) {
    console.error(
      `Error: invalid rarity "${rarity}". Valid values: ${validRarities.join(", ")}`
    );
    process.exit(1);
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gameTitle,
      achievementTitle,
      description,
      rarity,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Error unlocking achievement:", result.error);
    process.exit(1);
  }

  console.log("Achievement unlocked:", achievementTitle);
}

async function main() {
  const command = process.argv[2];

  if (!command || command === "help" || command === "--help") {
    showHelp();
    return;
  }

  if (command === "unlock") {
    await unlockAchievement();
    return;
  }

  console.error(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}

main().catch((error) => {
  console.error("Unexpected error:", error.message);
  process.exit(1);
});
