export type ProjectContext = {
  industry: string | null;
  target: string | null;
  product: string | null;
  model: string | null;
  integration: string | null;
  requirement: string | null;
  projectIntent: boolean;
};

export const EMPTY_PROJECT_CONTEXT: ProjectContext = {
  industry: null,
  target: null,
  product: null,
  model: null,
  integration: null,
  requirement: null,
  projectIntent: false,
};

export const PROJECT_CONTEXT_STORAGE_KEY =
  "xy-site-advisor-project-context";

export function hasProjectContext(
  context: ProjectContext
) {
  return Boolean(
    context.industry ||
      context.target ||
      context.product ||
      context.model ||
      context.integration ||
      context.requirement
  );
}