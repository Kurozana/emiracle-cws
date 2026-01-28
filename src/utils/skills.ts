/**
 * Skill utility functions
 * Builds display names from structured skill data
 */

export interface SkillTag {
  prefix: "OF" | "OF THE";
  name: string;
}

// Simple string tags for special markers (e.g., "main" for border styling)
export type SimpleTag = "main";

// Tags can be either structured (for animated text) or simple strings (for styling)
export type TagEntry = SkillTag | SimpleTag;

export interface Skill {
  baseName: string;
  color: "red" | "green" | "blue" | "white";
  isSupport: boolean;
  icon?: string;
  tags: TagEntry[];
  level?: number;
  levelWarning?: boolean;
}

/**
 * Check if a skill has a specific simple tag
 */
export function hasTag(skill: Skill, tag: SimpleTag): boolean {
  return skill.tags.some(t => t === tag);
}

/**
 * Get only structured tags (for animated text effects)
 */
export function getStructuredTags(tags: TagEntry[]): SkillTag[] {
  return tags.filter((t): t is SkillTag => typeof t === 'object') as SkillTag[];
}

export interface SkillSetup {
  title: string;
  description: string;
  isLinked: boolean;
  rows: { skillId: string }[][];
}

export interface Loadout {
  name: string;
  description: string;
  activeSetups: string[];
}

export interface SkillsData {
  version: string;
  loadouts: Record<string, Loadout>;
  skillSetups: Record<string, SkillSetup>;
  skills: Record<string, Skill>;
}

/**
 * Builds the full display name from structured skill data
 * Example: { baseName: "Volcano", tags: [{ prefix: "OF THE", name: "CONC GROUND" }] }
 * Returns: "Volcano OF THE CONC GROUND"
 * Note: Only uses structured tags, ignores simple string tags
 */
export function buildDisplayName(skill: Skill): string {
  const structuredTags = getStructuredTags(skill.tags);
  if (structuredTags.length === 0) {
    return skill.baseName;
  }

  const tagStrings = structuredTags.map(tag => `${tag.prefix} ${tag.name}`);
  return `${skill.baseName} ${tagStrings.join(" ")}`;
}

/**
 * Gets a skill by ID and returns its display-ready data
 */
export function getSkillDisplay(skills: Record<string, Skill>, skillId: string) {
  const skill = skills[skillId];
  if (!skill) {
    return null;
  }

  return {
    name: buildDisplayName(skill),
    color: skill.color,
    isSupport: skill.isSupport
  };
}
