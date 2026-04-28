import { buildProfile } from "@veldica/publishready-core";

export async function handleBuildReferenceProfile(args: {
  texts: string[];
  profile_name?: string;
}) {
  if (!args.texts || args.texts.length === 0) {
    throw new Error("At least one reference text is required.");
  }
  const profile = buildProfile(args.texts, args.profile_name);

  return {
    structuredContent: profile as unknown as Record<string, unknown>,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(profile, null, 2),
      },
    ],
  };
}
