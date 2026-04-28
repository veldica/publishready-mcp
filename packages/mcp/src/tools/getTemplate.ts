import { BUILTIN_TEMPLATES } from "@veldica/publishready-core";

export async function handleGetTemplate(args: { template_id: string }) {
  const template = BUILTIN_TEMPLATES.find((t) => t.id === args.template_id);
  if (!template) {
    throw new Error(`Template not found: ${args.template_id}`);
  }

  return {
    structuredContent: template as unknown as Record<string, unknown>,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(template, null, 2),
      },
    ],
  };
}
