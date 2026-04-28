import {
  compareProfiles,
  profileFromTargets,
  profileFromTemplate,
} from "@veldica/publishready-core";
import { WritingProfile } from "@veldica/publishready-schemas";
import { BUILTIN_TEMPLATES } from "@veldica/publishready-core";
import type { Targets } from "@veldica/publishready-schemas";

export async function handleCompareProfiles(args: {
  profile_a: WritingProfile | Targets | string;
  profile_b: WritingProfile | Targets | string;
}) {
  const resolveProfile = (p: WritingProfile | Targets | string): WritingProfile => {
    if (typeof p === "string") {
      const template = BUILTIN_TEMPLATES.find((t) => t.id === p);
      if (!template) throw new Error(`Template not found: ${p}`);

      return profileFromTemplate(template);
    }

    if ("counts" in p && "timestamp" in p) {
      return p;
    }

    return profileFromTargets(p, "Explicit Targets");
  };

  const a = resolveProfile(args.profile_a);
  const b = resolveProfile(args.profile_b);
  const comparison = compareProfiles(a, b);
  const payload = {
    profile_a_name: a.name ?? null,
    profile_b_name: b.name ?? null,
    ...comparison,
  };

  return {
    structuredContent: payload,
    content: [
      {
        type: "text" as const,
        text: `Profile Comparison: ${a.name} vs ${b.name}\nAlignment Score: ${comparison.alignment_score}/100`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}
