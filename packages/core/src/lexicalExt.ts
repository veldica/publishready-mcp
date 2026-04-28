import { countSyllables, DALE_CHALL_EASY_WORDS } from "@veldica/readability";
import { splitWords, splitSentencesFromBlock } from "@veldica/prose-tokenizer";
import type { SentenceDetail, ParagraphDetail } from "@veldica/publishready-schemas";

export function isDifficultWord(word: string): boolean {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.length === 0) return false;
  return !DALE_CHALL_EASY_WORDS.has(normalized);
}

export function analyzeAdvancedLexical(words: string[]) {
  let totalSyllables = 0;
  let polysyllables = 0;
  let complexWords = 0;
  let difficultWords = 0;
  let longWords = 0;
  let totalWordCharacters = 0;

  for (const word of words) {
    totalWordCharacters += word.length;
    const syllables = countSyllables(word);
    totalSyllables += syllables;

    if (syllables >= 3) {
      polysyllables += 1;
      complexWords += 1;
    }

    if (isDifficultWord(word)) {
      difficultWords += 1;
    }

    if (word.length >= 7) {
      longWords += 1;
    }
  }

  return {
    totalSyllables,
    polysyllables,
    complexWords,
    difficultWords,
    longWords,
    totalWordCharacters,
  };
}

export function buildSentenceDetails(sentencesRaw: string[]): SentenceDetail[] {
  return sentencesRaw.map((sentence, index) => {
    const words = splitWords(sentence);
    let syllableCount = 0;
    let complexWordCount = 0;
    let difficultWordCount = 0;

    for (const word of words) {
      const syllables = countSyllables(word);
      syllableCount += syllables;
      if (syllables >= 3) {
        complexWordCount += 1;
      }
      if (isDifficultWord(word)) {
        difficultWordCount += 1;
      }
    }

    return {
      index,
      text: sentence,
      word_count: words.length,
      syllable_count: syllableCount,
      complex_word_count: complexWordCount,
      difficult_word_count: difficultWordCount,
    };
  });
}

export function buildParagraphDetails(
  blocksRaw: { text: string; kind: string }[]
): ParagraphDetail[] {
  return blocksRaw
    .filter((b) => b.kind === "paragraph")
    .map((block, index) => ({
      index,
      text: block.text,
      word_count: splitWords(block.text).length,
      sentence_count: splitSentencesFromBlock(block as any).length,
    }));
}
