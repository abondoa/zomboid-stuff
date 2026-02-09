import { CommandHandler } from "./commands";
import { RconClient } from "./rcon";

const { host, port, password } = require("./config.json");

interface TestCase {
  workshopId: string;
  expectedModId: string;
}

// Add test cases here - simple array of { workshopId, expectedModId }
const testCases: TestCase[] = [
  {
    workshopId: "2650547917",
    expectedModId: "manageContainers",
  },
  { workshopId: "3036830549", expectedModId: "BetterClothingInfoComparison" },
  { workshopId: "2503622437", expectedModId: "SkillRecoveryJournal" },
  { workshopId: "2544353492", expectedModId: "P4HasBeenRead" },
  { workshopId: "3066276504", expectedModId: "containertags" },
  { workshopId: "2950902979", expectedModId: "EQUIPMENT_UI" },
  { workshopId: "2956146279", expectedModId: "RainCleansBlood" },
  { workshopId: "3370707195", expectedModId: "organizedCategories_core" },
  // Add more test cases below:
  // {
  //   workshopId: "123456789",
  //   expectedModId: "someModName",
  // },
];

async function runTests() {
  const rcon = new RconClient(host, port, password);
  const commandHandler = new CommandHandler(rcon);

  console.log(`Running ${testCases.length} test cases...\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const result = await (commandHandler as any).getModIdFromSteamWorkshop(
        testCase.workshopId,
      );
      if (result === testCase.expectedModId) {
        console.log(`✓ PASS: Workshop ID ${testCase.workshopId} -> ${result}`);
        passed++;
      } else {
        console.log(`✗ FAIL: Workshop ID ${testCase.workshopId}`);
        console.log(`  Expected: ${testCase.expectedModId}`);
        console.log(`  Got:      ${result}`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ERROR: Workshop ID ${testCase.workshopId}`);
      console.log(
        `  ${error instanceof Error ? error.message : String(error)}`,
      );
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  await rcon.end();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error("Test error:", error);
  process.exit(1);
});
