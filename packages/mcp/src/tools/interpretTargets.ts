import { interpretTargets } from "@veldica/publishready-core";
import { Targets } from "@veldica/publishready-schemas";

export async function handleInterpretTargets(args: { targets: Targets }) {
  const interpretation = interpretTargets(args.targets);

  return {
    structuredContent: interpretation as unknown as Record<string, unknown>,
    content: [
      {
        type: "text" as const,
        text: `Target Interpretation (Human Terms):\n${JSON.stringify(interpretation, null, 2)}`,
      },
    ],
  };
}
