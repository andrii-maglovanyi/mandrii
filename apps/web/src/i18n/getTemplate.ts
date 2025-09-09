export const getTemplate = (template: string, options?: Record<string, Date | number | string>) => {
  if (!options) return template;

  return template.replace(/\{([^{}]+)\}/g, (_, key) => {
    const value = options[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
};
