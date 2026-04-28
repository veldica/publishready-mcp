import { Template } from "@veldica/publishready-schemas";

type TemplateSeed = Omit<
  Template,
  "hard_fails" | "soft_preferences" | "signal_interpretations" | "revision_priorities" | "tradeoffs"
> &
  Partial<
    Pick<
      Template,
      | "hard_fails"
      | "soft_preferences"
      | "signal_interpretations"
      | "revision_priorities"
      | "tradeoffs"
    >
  >;

const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    id: "plain_english_general",
    name: "Plain English (General)",
    family: "nonfiction",
    audience: "General Public",
    use_case: "Public communications, general interest articles",
    description: "Clear, accessible English suitable for a broad audience.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 18, operator: "at_most" },
        sentence_length_p90: { value: 25, operator: "at_most" },
      },
      lexical_metrics: {
        difficult_word_ratio: { value: 0.1, operator: "at_most" },
      },
      formulas: {
        flesch_reading_ease: { value: 60, operator: "at_least" },
        consensus_grade: { value: 9, operator: "at_most" },
      },
    },
  },
  {
    id: "landing_page_conversion",
    name: "Landing Page (Conversion)",
    family: "nonfiction",
    audience: "Potential Customers",
    use_case: "Marketing landing pages, sales copy",
    description: "Punchy, scannable copy designed for high conversion.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 12, operator: "at_most" },
      },
      paragraph_metrics: {
        avg_words_per_paragraph: { value: 40, operator: "at_most" },
      },
      scannability_metrics: {
        heading_density: { value: 0.05, operator: "at_least" },
      },
    },
  },
  {
    id: "seo_blog_post",
    name: "SEO Blog Post",
    family: "nonfiction",
    audience: "Search Users / Blog Readers",
    use_case: "Educational or informational blog content",
    description: "Balanced for readability and search engine optimization.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 20, operator: "at_most" },
      },
      scannability_metrics: {
        heading_density: { value: 0.02, operator: "at_least" },
      },
    },
  },
  {
    id: "executive_summary",
    name: "Executive Summary",
    family: "nonfiction",
    audience: "Busy Decision Makers",
    use_case: "Report summaries, internal memos",
    description: "High density of information with absolute clarity.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 22, operator: "at_most" },
      },
      lexical_metrics: {
        difficult_word_ratio: { value: 0.15, operator: "at_most" },
      },
    },
  },
  {
    id: "newsletter_email",
    name: "Newsletter Email",
    family: "nonfiction",
    audience: "Subscribers",
    use_case: "Email marketing, personal newsletters",
    description: "Conversational yet concise.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 15, operator: "at_most" },
      },
    },
  },
  {
    id: "technical_docs",
    name: "Technical Documentation",
    family: "nonfiction",
    audience: "Developers / Engineers",
    use_case: "Software manuals, system guides",
    description: "Precise, structured, and reference-heavy.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 20, operator: "at_most" },
      },
      scannability_metrics: {
        heading_density: { value: 0.03, operator: "at_least" },
      },
    },
  },
  {
    id: "api_reference",
    name: "API Reference",
    family: "nonfiction",
    audience: "Developers",
    use_case: "Endpoint descriptions, parameter documentation",
    description: "Extremely concise and descriptive.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 15, operator: "at_most" },
      },
    },
  },
  {
    id: "product_description",
    name: "Product Description",
    family: "nonfiction",
    audience: "Shoppers",
    use_case: "E-commerce product pages",
    description: "Descriptive and persuasive.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 16, operator: "at_most" },
      },
    },
  },
  {
    id: "support_article",
    name: "Support Article",
    family: "nonfiction",
    audience: "Users seeking help",
    use_case: "Knowledge base, FAQ",
    description: "Instructional and simple.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 15, operator: "at_most" },
      },
      formulas: {
        consensus_grade: { value: 8, operator: "at_most" },
      },
    },
  },
  {
    id: "thought_leadership_light",
    name: "Thought Leadership (Light)",
    family: "nonfiction",
    audience: "Professional peers",
    use_case: "LinkedIn posts, industry commentary",
    description: "Engaging, authoritative, but accessible.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 18, operator: "at_most" },
      },
    },
  },
  {
    id: "healthcare_plain_language",
    name: "Healthcare Plain Language",
    family: "nonfiction",
    audience: "Patients",
    use_case: "Patient education, medical advice",
    description: "Strict adherence to plain language standards for health literacy.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 15, operator: "at_most" },
      },
      lexical_metrics: {
        difficult_word_ratio: { value: 0.05, operator: "at_most" },
      },
      formulas: {
        consensus_grade: { value: 7, operator: "at_most" },
      },
    },
  },
  {
    id: "education_explainer",
    name: "Education Explainer",
    family: "nonfiction",
    audience: "Students",
    use_case: "Textbooks, online courses",
    description: "Pedagogical clarity.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 18, operator: "at_most" },
      },
      formulas: {
        consensus_grade: { value: 9, operator: "at_most" },
      },
    },
  },
  {
    id: "social_media_short",
    name: "Social Media (Short Post)",
    family: "nonfiction",
    audience: "Social Feed Browsers",
    use_case: "Twitter/X, LinkedIn short posts, microblog updates",
    description: "Extremely compact sentences optimized for fast scanning on small screens.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 12, operator: "at_most" },
        sentence_length_p90: { value: 18, operator: "at_most" },
      },
      paragraph_metrics: {
        avg_words_per_paragraph: { value: 30, operator: "at_most" },
      },
      formulas: {
        consensus_grade: { value: 8, operator: "at_most" },
      },
    },
  },
  {
    id: "academic_abstract",
    name: "Academic Abstract",
    family: "nonfiction",
    audience: "Researchers / Peer Reviewers",
    use_case: "Journal article abstracts, conference submissions",
    description: "Dense, precise, information-rich prose with domain vocabulary permitted.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 28, operator: "at_most" },
        sentence_length_p90: { value: 40, operator: "at_most" },
      },
      lexical_metrics: {
        difficult_word_ratio: { value: 0.25, operator: "at_most" },
      },
      formulas: {
        consensus_grade: { value: 14, operator: "at_most" },
      },
    },
  },
  {
    id: "press_release",
    name: "Press Release",
    family: "nonfiction",
    audience: "Journalists",
    use_case: "Corporate announcements, media outreach",
    description: "Inverted-pyramid style with short lead sentences and quotable phrasing.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 18, operator: "at_most" },
      },
      paragraph_metrics: {
        avg_words_per_paragraph: { value: 60, operator: "at_most" },
      },
      formulas: {
        flesch_reading_ease: { value: 55, operator: "at_least" },
      },
    },
  },
  {
    id: "resume_bullets",
    name: "Résumé Bullets",
    family: "nonfiction",
    audience: "Recruiters / Hiring Managers",
    use_case: "Résumé achievement bullets, LinkedIn experience entries",
    description: "Action-led, concise bullets emphasizing outcomes and measurable results.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 14, operator: "at_most" },
      },
      paragraph_metrics: {
        avg_words_per_paragraph: { value: 25, operator: "at_most" },
      },
    },
  },
  // Fiction Templates
  {
    id: "commercial_fiction",
    name: "Commercial Fiction",
    family: "fiction",
    audience: "General Readers",
    use_case: "Mainstream novels, genre fiction",
    description: "Engaging pacing and accessible vocabulary.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 15, operator: "at_most" },
      },
      fiction_metrics: {
        dialogue_ratio: { value: 0.3, operator: "at_least" },
      },
    },
  },
  {
    id: "literary_fiction",
    name: "Literary Fiction",
    family: "fiction",
    audience: "Avid Readers",
    use_case: "Artistic or character-driven novels",
    description: "More complex sentence structures and richer vocabulary allowed.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 25, operator: "at_most" },
      },
    },
  },
  {
    id: "thriller_fast_paced",
    name: "Thriller (Fast-Paced)",
    family: "fiction",
    audience: "Thriller Readers",
    use_case: "Action scenes, high-tension chapters",
    description: "Short sentences and paragraphs to drive tension.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 12, operator: "at_most" },
      },
      paragraph_metrics: {
        avg_words_per_paragraph: { value: 50, operator: "at_most" },
      },
    },
  },
  {
    id: "ya_accessible",
    name: "YA (Accessible)",
    family: "fiction",
    audience: "Young Adults",
    use_case: "Young adult novels",
    description: "Direct and emotive.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 14, operator: "at_most" },
      },
    },
  },
  {
    id: "middle_grade",
    name: "Middle Grade",
    family: "fiction",
    audience: "8-12 Year Olds",
    use_case: "Middle grade fiction",
    description: "Simple but not childish.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 12, operator: "at_most" },
      },
      formulas: {
        consensus_grade: { value: 6, operator: "at_most" },
      },
    },
  },
  {
    id: "romance_emotive",
    name: "Romance (Emotive)",
    family: "fiction",
    audience: "Romance Readers",
    use_case: "Romance novels",
    description: "Focus on internal state and emotional resonance.",
    targets: {
      fiction_metrics: {
        dialogue_ratio: { value: 0.35, operator: "at_least" },
      },
    },
  },
  {
    id: "dialogue_heavy_scene",
    name: "Dialogue-Heavy Scene",
    family: "fiction",
    audience: "Fiction Readers",
    use_case: "Conversations, confrontations",
    description: "High dialogue ratio with snappy exchanges.",
    targets: {
      fiction_metrics: {
        dialogue_ratio: { value: 0.6, operator: "at_least" },
      },
    },
  },
  {
    id: "action_scene",
    name: "Action Scene",
    family: "fiction",
    audience: "Fiction Readers",
    use_case: "Fight scenes, chases",
    description: "Short, punchy sentences.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 10, operator: "at_most" },
      },
    },
  },
  {
    id: "exposition_heavy_chapter",
    name: "Exposition-Heavy Chapter",
    family: "fiction",
    audience: "Fiction Readers",
    use_case: "World building, background info",
    description: "Higher word count per paragraph allowed.",
    targets: {
      paragraph_metrics: {
        avg_words_per_paragraph: { value: 100, operator: "at_most" },
      },
    },
  },
  {
    id: "children_readaloud",
    name: "Children's Read-Aloud",
    family: "fiction",
    audience: "Young Children / Parents",
    use_case: "Picture books, read-aloud stories",
    description: "Rhythmic and very simple vocabulary.",
    targets: {
      sentence_metrics: {
        avg_words_per_sentence: { value: 10, operator: "at_most" },
      },
      formulas: {
        consensus_grade: { value: 4, operator: "at_most" },
      },
    },
  },
];

export const BUILTIN_TEMPLATES: Template[] = TEMPLATE_SEEDS.map(enrichTemplate);

function enrichTemplate(template: TemplateSeed): Template {
  const enrichedSeed = {
    ...template,
    targets: enrichTargets(template),
  };

  return {
    ...enrichedSeed,
    hard_fails: {
      ...hardFailsFor(enrichedSeed),
      ...template.hard_fails,
    },
    soft_preferences: {
      ...softPreferencesFor(enrichedSeed),
      ...template.soft_preferences,
    },
    signal_interpretations: {
      ...signalInterpretationsFor(enrichedSeed),
      ...template.signal_interpretations,
    },
    revision_priorities: template.revision_priorities ?? revisionPrioritiesFor(enrichedSeed),
    tradeoffs: template.tradeoffs ?? tradeoffsFor(enrichedSeed),
  };
}

function enrichTargets(template: TemplateSeed): Template["targets"] {
  const targets: Template["targets"] = {
    ...template.targets,
    sentence_metrics: { ...template.targets.sentence_metrics },
    paragraph_metrics: { ...template.targets.paragraph_metrics },
    lexical_metrics: { ...template.targets.lexical_metrics },
    scannability_metrics: { ...template.targets.scannability_metrics },
    fiction_metrics: template.targets.fiction_metrics
      ? { ...template.targets.fiction_metrics }
      : undefined,
    formulas: { ...template.targets.formulas },
  };

  const defaultSentenceAverage = sentenceAverageFor(template);
  targets.sentence_metrics!.avg_words_per_sentence ??= {
    value: defaultSentenceAverage,
    operator: "at_most",
  };
  targets.sentence_metrics!.sentence_length_p95 ??= {
    value: roundTarget(defaultSentenceAverage * sentenceTailMultiplierFor(template)),
    operator: "at_most",
  };

  const defaultParagraphAverage = paragraphAverageFor(template);
  targets.paragraph_metrics!.avg_words_per_paragraph ??= {
    value: defaultParagraphAverage,
    operator: "at_most",
  };
  targets.paragraph_metrics!.paragraph_length_p95 ??= {
    value: roundTarget(defaultParagraphAverage * paragraphTailMultiplierFor(template)),
    operator: "at_most",
  };

  const defaultAvgCharacters =
    template.family === "fiction"
      ? template.id === "literary_fiction"
        ? 5.4
        : 5.1
      : template.id === "academic_abstract" || template.id === "technical_docs"
        ? 5.8
        : 5.2;

  targets.lexical_metrics!.avg_characters_per_word ??= {
    value: defaultAvgCharacters,
    operator: "at_most",
  };
  targets.lexical_metrics!.difficult_word_ratio ??= {
    value: difficultWordRatioFor(template),
    operator: "at_most",
  };
  targets.lexical_metrics!.lexical_diversity_mattr ??= {
    value: template.family === "fiction" ? 0.55 : 0.5,
    operator: "at_least",
  };
  targets.formulas!.consensus_grade ??= {
    value: consensusGradeFor(template),
    operator: "at_most",
  };

  if (template.family === "nonfiction") {
    const headingDensity = headingDensityFor(template);
    if (headingDensity !== null) {
      targets.scannability_metrics!.heading_density ??= {
        value: headingDensity,
        operator: "at_least",
      };
    }
    targets.scannability_metrics!.paragraph_scannability_score ??= {
      value: template.id === "landing_page_conversion" ? 85 : 70,
      operator: "at_least",
    };
  } else {
    targets.fiction_metrics ??= {};
    targets.fiction_metrics.dialogue_ratio ??= dialogueRatioFor(template);
    targets.fiction_metrics.scene_density_proxy ??= sceneDensityFor(template);
    targets.fiction_metrics.exposition_density_proxy ??= expositionDensityFor(template);
    targets.fiction_metrics.sensory_term_density ??= {
      value: template.id === "children_readaloud" ? 0.02 : 0.01,
      operator: "at_least",
    };
    targets.fiction_metrics.abstract_word_ratio ??= {
      value: template.id === "literary_fiction" ? 0.08 : 0.05,
      operator: "at_most",
    };
  }

  return targets;
}

function sentenceAverageFor(template: TemplateSeed): number {
  const byId: Record<string, number> = {
    romance_emotive: 16,
    dialogue_heavy_scene: 13,
    exposition_heavy_chapter: 22,
    literary_fiction: 24,
    children_readaloud: 9,
    api_reference: 14,
    resume_bullets: 13,
    academic_abstract: 27,
  };

  return byId[template.id] ?? (template.family === "fiction" ? 15 : 18);
}

function sentenceTailMultiplierFor(template: TemplateSeed): number {
  if (template.id === "literary_fiction" || template.id === "academic_abstract") return 1.7;
  if (template.id === "action_scene" || template.id === "children_readaloud") return 1.6;
  return 1.8;
}

function paragraphAverageFor(template: TemplateSeed): number {
  const byId: Record<string, number> = {
    landing_page_conversion: 40,
    api_reference: 30,
    support_article: 45,
    resume_bullets: 25,
    social_media_short: 30,
    academic_abstract: 90,
    technical_docs: 70,
    thriller_fast_paced: 50,
    action_scene: 35,
    dialogue_heavy_scene: 45,
    children_readaloud: 25,
    literary_fiction: 110,
    exposition_heavy_chapter: 100,
  };

  return byId[template.id] ?? (template.family === "fiction" ? 70 : 60);
}

function paragraphTailMultiplierFor(template: TemplateSeed): number {
  if (template.id === "literary_fiction" || template.id === "exposition_heavy_chapter") {
    return 1.8;
  }
  if (template.id === "api_reference" || template.id === "resume_bullets") return 1.5;
  return 1.7;
}

function difficultWordRatioFor(template: TemplateSeed): number {
  const byId: Record<string, number> = {
    healthcare_plain_language: 0.05,
    children_readaloud: 0.04,
    middle_grade: 0.06,
    support_article: 0.08,
    plain_english_general: 0.1,
    academic_abstract: 0.25,
    technical_docs: 0.18,
    api_reference: 0.18,
    literary_fiction: 0.18,
  };

  return byId[template.id] ?? (template.family === "fiction" ? 0.12 : 0.14);
}

function consensusGradeFor(template: TemplateSeed): number {
  const byId: Record<string, number> = {
    children_readaloud: 4,
    middle_grade: 6,
    healthcare_plain_language: 7,
    support_article: 8,
    plain_english_general: 9,
    education_explainer: 9,
    academic_abstract: 14,
    technical_docs: 12,
    api_reference: 11,
    literary_fiction: 12,
    exposition_heavy_chapter: 12,
  };

  return byId[template.id] ?? (template.family === "fiction" ? 9 : 10);
}

function headingDensityFor(template: TemplateSeed): number | null {
  const byId: Record<string, number | null> = {
    landing_page_conversion: 0.05,
    technical_docs: 0.03,
    api_reference: 0.04,
    support_article: 0.035,
    seo_blog_post: 0.02,
    social_media_short: null,
    resume_bullets: null,
  };

  return byId[template.id] ?? 0.015;
}

function dialogueRatioFor(template: TemplateSeed): {
  value: number;
  operator: "at_least" | "at_most";
} {
  const byId: Record<string, number> = {
    commercial_fiction: 0.3,
    romance_emotive: 0.35,
    dialogue_heavy_scene: 0.6,
    thriller_fast_paced: 0.18,
    action_scene: 0.12,
    literary_fiction: 0.1,
    exposition_heavy_chapter: 0.05,
    children_readaloud: 0.15,
  };

  return { value: byId[template.id] ?? 0.2, operator: "at_least" };
}

function sceneDensityFor(template: TemplateSeed): {
  value: number;
  operator: "at_least" | "at_most";
} {
  if (template.id === "exposition_heavy_chapter" || template.id === "literary_fiction") {
    return { value: 0.45, operator: "at_most" };
  }

  const byId: Record<string, number> = {
    thriller_fast_paced: 0.55,
    action_scene: 0.65,
    dialogue_heavy_scene: 0.45,
    romance_emotive: 0.35,
    children_readaloud: 0.35,
  };

  return { value: byId[template.id] ?? 0.35, operator: "at_least" };
}

function expositionDensityFor(template: TemplateSeed): {
  value: number;
  operator: "at_least" | "at_most";
} {
  if (template.id === "exposition_heavy_chapter") {
    return { value: 0.25, operator: "at_least" };
  }

  return {
    value: template.id === "literary_fiction" ? 0.45 : 0.3,
    operator: "at_most",
  };
}

function hardFailsFor(template: TemplateSeed): Record<string, string> {
  const hardFails: Record<string, string> = {};
  const targets = template.targets;

  if (targets.sentence_metrics?.avg_words_per_sentence) {
    hardFails.avg_words_per_sentence = `Average sentence length should stay ${targetPhrase(
      targets.sentence_metrics.avg_words_per_sentence
    )} to preserve the intended pace.`;
  }
  if (targets.sentence_metrics?.sentence_length_p90) {
    hardFails.sentence_length_p90 = `The sentence-length tail should stay ${targetPhrase(
      targets.sentence_metrics.sentence_length_p90
    )}; outlier sentences are the first readability risk.`;
  }
  if (targets.paragraph_metrics?.avg_words_per_paragraph) {
    hardFails.avg_words_per_paragraph = `Average paragraph length should stay ${targetPhrase(
      targets.paragraph_metrics.avg_words_per_paragraph
    )} for the expected scanning pattern.`;
  }
  if (targets.lexical_metrics?.difficult_word_ratio) {
    hardFails.difficult_word_ratio = `Difficult-word ratio should stay ${targetPhrase(
      targets.lexical_metrics.difficult_word_ratio
    )} for the intended audience.`;
  }
  if (targets.lexical_metrics?.avg_characters_per_word) {
    hardFails.avg_characters_per_word = `Average characters per word should stay ${targetPhrase(
      targets.lexical_metrics.avg_characters_per_word
    )} to keep word shape aligned with the profile.`;
  }
  if (targets.scannability_metrics?.paragraph_scannability_score) {
    hardFails.paragraph_scannability_score = `Paragraph scannability should stay ${targetPhrase(
      targets.scannability_metrics.paragraph_scannability_score
    )} for the expected reading environment.`;
  }
  if (targets.formulas?.consensus_grade) {
    hardFails.consensus_grade = `Consensus grade should stay ${targetPhrase(
      targets.formulas.consensus_grade
    )} unless the audience is deliberately more specialized.`;
  }
  if (targets.fiction_metrics?.dialogue_ratio) {
    hardFails.dialogue_ratio = `Dialogue ratio should stay ${targetPhrase(
      targets.fiction_metrics.dialogue_ratio
    )} to match the scene profile.`;
  }
  if (targets.fiction_metrics?.abstract_word_ratio) {
    hardFails.abstract_word_ratio = `Abstract-word ratio should stay ${targetPhrase(
      targets.fiction_metrics.abstract_word_ratio
    )} so the scene remains grounded.`;
  }

  return hardFails;
}

function softPreferencesFor(template: TemplateSeed): Record<string, string> {
  const preferences: Record<string, string> = {};
  const targets = template.targets;

  if (template.family === "nonfiction") {
    preferences.scannability =
      "Prefer clear sectioning, front-loaded sentences, and visible breaks.";
    preferences.vocabulary =
      "Prefer concrete vocabulary unless domain precision requires technical terms.";
  } else {
    preferences.rhythm =
      "Prefer cadence that supports scene intent rather than uniform simplicity.";
    preferences.immersion =
      "Prefer concrete sensory detail when it improves immediacy without slowing pace.";
  }

  if (targets.scannability_metrics?.heading_density) {
    preferences.heading_density = `Headings should generally be ${targetPhrase(
      targets.scannability_metrics.heading_density
    )}, but avoid decorative headings that do not help navigation.`;
  }
  if (targets.lexical_metrics?.repetition_ratio) {
    preferences.repetition_ratio = `Repeated wording should stay ${targetPhrase(
      targets.lexical_metrics.repetition_ratio
    )} unless deliberate keyword consistency matters.`;
  }
  if (targets.fiction_metrics?.scene_density_proxy) {
    preferences.scene_density_proxy = `Scene density should stay ${targetPhrase(
      targets.fiction_metrics.scene_density_proxy
    )} when immediacy is more important than exposition.`;
  }

  return preferences;
}

function signalInterpretationsFor(template: TemplateSeed): Record<string, string> {
  const interpretations: Record<string, string> = {
    avg_characters_per_word:
      template.family === "fiction"
        ? "Tracks vocabulary texture and whether diction feels elevated for narrative prose."
        : "Tracks vocabulary accessibility and jargon pressure for the intended audience.",
    lexical_diversity_mattr:
      "Shows local vocabulary variety without over-rewarding short passages.",
    sentence_length_p95:
      "Surfaces the longest sentence tail, which often matters more than the average.",
  };

  if (template.family === "nonfiction") {
    interpretations.paragraph_scannability_score =
      "Indicates whether readers can skim and recover the argument quickly.";
    interpretations.heading_density =
      "Measures navigational signposts; useful for web, support, and reference writing.";
  } else {
    interpretations.dialogue_ratio = "Measures conversational immediacy and character interaction.";
    interpretations.scene_density_proxy =
      "Combines short sentence share, dialogue, and cadence variation into a pacing proxy.";
    interpretations.sensory_term_density = "Flags whether scenes are grounded in physical details.";
  }

  return interpretations;
}

function revisionPrioritiesFor(template: TemplateSeed): string[] {
  const priorities: string[] = [];
  const targets = template.targets;

  if (
    targets.sentence_metrics?.avg_words_per_sentence ||
    targets.sentence_metrics?.sentence_length_p90 ||
    targets.sentence_metrics?.sentence_length_p95
  ) {
    priorities.push("shorten_long_sentences", "break_sentence_tails");
  }
  if (targets.paragraph_metrics?.avg_words_per_paragraph) {
    priorities.push("split_oversized_paragraphs");
  }
  if (targets.scannability_metrics?.heading_density) {
    priorities.push("increase_heading_frequency", "introduce_lists_for_scannability");
  }
  if (
    targets.lexical_metrics?.difficult_word_ratio ||
    targets.lexical_metrics?.complex_word_ratio ||
    targets.formulas?.consensus_grade
  ) {
    priorities.push("replace_difficult_words", "reduce_complex_word_density");
  }
  if (targets.fiction_metrics?.dialogue_ratio) {
    priorities.push("improve_dialogue_balance");
  }
  if (targets.fiction_metrics?.scene_density_proxy) {
    priorities.push("tighten_scene_pacing");
  }

  if (template.family === "fiction") {
    priorities.push("ground_with_sensory_details", "reduce_abstract_wording");
  } else {
    priorities.push("add_breaks_to_dense_sections");
  }

  return [...new Set(priorities)].slice(0, 6);
}

function tradeoffsFor(template: TemplateSeed): string[] {
  const tradeoffs =
    template.family === "fiction"
      ? [
          "Shorter sentences increase pace but can flatten lyrical or reflective passages.",
          "More dialogue increases immediacy but can reduce interiority and atmosphere.",
          "Lower vocabulary difficulty improves accessibility but may weaken a distinctive voice.",
        ]
      : [
          "Lower grade level improves access but can remove necessary domain precision.",
          "More headings improve scanning but can make a short piece feel fragmented.",
          "Shorter paragraphs help digital reading but may reduce argumentative depth.",
        ];

  if (template.id.includes("technical") || template.id === "api_reference") {
    tradeoffs.push(
      "Consistent terminology can look repetitive in metrics but may be correct for reference material."
    );
  }
  if (template.id.includes("literary") || template.id === "exposition_heavy_chapter") {
    tradeoffs.push(
      "Dense paragraphs may be intentional when immersion or world-building matters more than speed."
    );
  }

  return tradeoffs;
}

function targetPhrase(target: { value: number; operator: "at_least" | "at_most" }): string {
  return `${target.operator === "at_least" ? "at least" : "at most"} ${target.value}`;
}

function roundTarget(value: number): number {
  return Number(value.toFixed(1));
}
