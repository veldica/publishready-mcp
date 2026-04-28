import { BUILTIN_TEMPLATES } from "@veldica/publishready-core";

export async function handleListTemplates(args: {
  family?: "nonfiction" | "fiction";
  audience?: string;
  use_case?: string;
  query?: string;
}) {
  const audience = args.audience?.toLowerCase();
  const useCase = args.use_case?.toLowerCase();
  const query = args.query?.toLowerCase();

  const filtered = BUILTIN_TEMPLATES.filter((template) => {
    if (args.family && template.family !== args.family) {
      return false;
    }
    if (audience && !template.audience.toLowerCase().includes(audience)) {
      return false;
    }
    if (useCase && !template.use_case.toLowerCase().includes(useCase)) {
      return false;
    }
    if (query) {
      const searchable = [
        template.id,
        template.name,
        template.description,
        template.audience,
        template.use_case,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    }

    return true;
  });

  const summaries = filtered.map((t) => ({
    id: t.id,
    name: t.name,
    family: t.family,
    description: t.description,
    audience: t.audience,
    use_case: t.use_case,
  }));

  return {
    structuredContent: { templates: summaries, count: summaries.length },
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(summaries, null, 2),
      },
    ],
  };
}
