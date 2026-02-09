/**
 * Template Engine for Programmatic SEO
 * Handles variable interpolation and template rendering
 * Reusable across projects
 */

/**
 * Interpolate variables in a string template
 * Supports nested objects with dot notation: {{user.name}}
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {object} data - Data object with values
 * @returns {string} - Interpolated string
 */
export function interpolate(template, data) {
	if (!template || typeof template !== "string") return template;

	return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
		const keys = path.trim().split(".");
		let value = data;

		for (const key of keys) {
			value = value?.[key];
			if (value === undefined) break;
		}

		return value !== undefined ? value : match;
	});
}

/**
 * Interpolate all strings in an object recursively
 * @param {object} obj - Object with template strings
 * @param {object} data - Data for interpolation
 * @returns {object} - Object with interpolated values
 */
export function interpolateObject(obj, data) {
	if (typeof obj === "string") {
		return interpolate(obj, data);
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => interpolateObject(item, data));
	}

	if (obj && typeof obj === "object") {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = interpolateObject(value, data);
		}
		return result;
	}

	return obj;
}

/**
 * Render a template with context data
 * @param {object} templateConfig - Template configuration
 * @param {object} context - Context data for rendering
 * @returns {object} - Rendered template
 */
export function renderTemplate(templateConfig, context) {
	const enrichedContext = {
		...context,
		// Add utility functions available in templates
		capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
		uppercase: (str) => str.toUpperCase(),
		lowercase: (str) => str.toLowerCase(),
		slugify: (str) =>
			str
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, ""),
	};

	return interpolateObject(templateConfig, enrichedContext);
}

/**
 * Template registry for managing multiple templates
 */
export class TemplateRegistry {
	constructor() {
		this.templates = new Map();
	}

	/**
	 * Register a template
	 * @param {string} name - Template name
	 * @param {object} template - Template configuration
	 */
	register(name, template) {
		this.templates.set(name, template);
	}

	/**
	 * Get a template by name
	 * @param {string} name - Template name
	 * @returns {object} - Template configuration
	 */
	get(name) {
		return this.templates.get(name);
	}

	/**
	 * Render a template by name
	 * @param {string} name - Template name
	 * @param {object} context - Context data
	 * @returns {object} - Rendered template
	 */
	render(name, context) {
		const template = this.get(name);
		if (!template) {
			throw new Error(`Template "${name}" not found`);
		}
		return renderTemplate(template, context);
	}

	/**
	 * List all registered templates
	 * @returns {string[]} - Array of template names
	 */
	list() {
		return Array.from(this.templates.keys());
	}
}

// Global template registry instance
export const globalTemplateRegistry = new TemplateRegistry();
