/**
 * Skill utility functions
 * Builds display names from structured skill data
 */

export interface SkillTag {
  prefix: "OF" | "OF THE";
  name: string;
}

export interface Skill {
  baseName: string;
  color: "red" | "green" | "blue" | "white";
  isSupport: boolean;
  icon?: string;
  tags: SkillTag[];
  level?: number;
  levelWarning?: boolean;
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
 */
export function buildDisplayName(skill: Skill): string {
  if (skill.tags.length === 0) {
    return skill.baseName;
  }

  const tagStrings = skill.tags.map(tag => `${tag.prefix} ${tag.name}`);
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
