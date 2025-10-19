// Certificate Template Manager - Combines all templates and provides unified interface

import {
	CertificateData,
	CertificateColors,
	COLOR_SCHEMES,
	generateClassicTemplate,
	generateModernTemplate,
	generateVintageTemplate,
} from './certificate-html-templates';

import {
	generateGeometricTemplate,
	generateCorporateTemplate,
} from './certificate-html-templates-2';

import {
	generateAcademicTemplate,
	generateArtisticTemplate,
	generateTechTemplate,
} from './certificate-html-templates-3';

// Template definitions with metadata
export interface CertificateTemplate {
	id: string;
	name: string;
	description: string;
	style: string;
	generator: (data: CertificateData, colors: CertificateColors) => string;
	preview: string; // CSS class for preview
}

// All available certificate templates
export const CERTIFICATE_TEMPLATES_NEW: CertificateTemplate[] = [
	{
		id: 'classic',
		name: 'Classic Formal',
		description: 'Traditional formal certificate with elegant borders',
		style: 'classic',
		generator: generateClassicTemplate,
		preview:
			'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300',
	},
	{
		id: 'modern',
		name: 'Modern Minimalist',
		description: 'Clean, contemporary design with geometric elements',
		style: 'modern',
		generator: generateModernTemplate,
		preview:
			'bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300',
	},
	{
		id: 'vintage',
		name: 'Elegant Vintage',
		description: 'Ornate vintage design with decorative elements',
		style: 'vintage',
		generator: generateVintageTemplate,
		preview:
			'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300',
	},
	{
		id: 'geometric',
		name: 'Creative Geometric',
		description: 'Bold geometric patterns with modern typography',
		style: 'geometric',
		generator: generateGeometricTemplate,
		preview:
			'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300',
	},
	{
		id: 'corporate',
		name: 'Professional Corporate',
		description: 'Clean corporate design suitable for business events',
		style: 'corporate',
		generator: generateCorporateTemplate,
		preview:
			'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300',
	},
	{
		id: 'academic',
		name: 'Academic Excellence',
		description: 'Formal academic style with institutional elements',
		style: 'academic',
		generator: generateAcademicTemplate,
		preview:
			'bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300',
	},
	{
		id: 'artistic',
		name: 'Creative Artistic',
		description: 'Artistic design with creative fonts and decorative elements',
		style: 'artistic',
		generator: generateArtisticTemplate,
		preview:
			'bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300',
	},
	{
		id: 'tech',
		name: 'Tech Innovation',
		description: 'Modern tech-inspired design with digital elements',
		style: 'tech',
		generator: generateTechTemplate,
		preview:
			'bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-300',
	},
];

// Color scheme options
export const COLOR_OPTIONS = [
	{ id: 'blue', name: 'Professional Blue', preview: 'bg-blue-500' },
	{ id: 'purple', name: 'Royal Purple', preview: 'bg-purple-500' },
	{ id: 'green', name: 'Nature Green', preview: 'bg-green-500' },
	{ id: 'orange', name: 'Energetic Orange', preview: 'bg-orange-500' },
	{ id: 'gold', name: 'Luxury Gold', preview: 'bg-yellow-500' },
];

// Template + Color combinations (5 templates × 5 colors = 25 combinations)
export interface CertificateTemplateOption {
	id: string;
	templateId: string;
	colorId: string;
	name: string;
	description: string;
	preview: string;
}

export const getAllTemplateOptions = (): CertificateTemplateOption[] => {
	const options: CertificateTemplateOption[] = [];

	CERTIFICATE_TEMPLATES_NEW.forEach((template) => {
		COLOR_OPTIONS.forEach((color) => {
			options.push({
				id: `${template.id}-${color.id}`,
				templateId: template.id,
				colorId: color.id,
				name: `${template.name} - ${color.name}`,
				description: `${
					template.description
				} with ${color.name.toLowerCase()} color scheme`,
				preview: `${template.preview} ${color.preview}`,
			});
		});
	});

	return options;
};

// Generate certificate HTML using template and color combination
export const generateCertificateHTML = (
	templateId: string,
	colorId: string,
	data: CertificateData
): string => {
	const template = CERTIFICATE_TEMPLATES_NEW.find((t) => t.id === templateId);
	const colors = COLOR_SCHEMES[colorId];

	if (!template) {
		throw new Error(`Template not found: ${templateId}`);
	}

	if (!colors) {
		throw new Error(`Color scheme not found: ${colorId}`);
	}

	return template.generator(data, colors);
};

// Get template by ID
export const getTemplateById = (
	templateId: string
): CertificateTemplate | undefined => {
	return CERTIFICATE_TEMPLATES_NEW.find((t) => t.id === templateId);
};

// Get color scheme by ID
export const getColorSchemeById = (
	colorId: string
): CertificateColors | undefined => {
	return COLOR_SCHEMES[colorId];
};

// Generate sample certificate data for preview
export const getSampleCertificateData = (
	role: string = 'participant'
): CertificateData => {
	const certificateTypes: Record<string, string> = {
		participant: 'Participation',
		volunteer: 'Volunteer Service',
		speaker: 'Speaker Recognition',
		organizer: 'Event Organization',
	};

	return {
		recipientName: 'John Doe',
		eventName: 'Sample Event 2024',
		organizerName: 'Event Organizer',
		certificateType: certificateTypes[role] || 'Participation',
		eventDate: 'December 15, 2024',
		role: role,
		certificateId: `CERT-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)
			.toUpperCase()}`,
	};
};

// Validate certificate data
export const validateCertificateData = (
	data: Partial<CertificateData>
): string[] => {
	const errors: string[] = [];

	if (!data.recipientName?.trim()) {
		errors.push('Recipient name is required');
	}

	if (!data.eventName?.trim()) {
		errors.push('Event name is required');
	}

	if (!data.organizerName?.trim()) {
		errors.push('Organizer name is required');
	}

	if (!data.certificateType?.trim()) {
		errors.push('Certificate type is required');
	}

	if (!data.eventDate?.trim()) {
		errors.push('Event date is required');
	}

	if (!data.role?.trim()) {
		errors.push('Role is required');
	}

	return errors;
};

// Export everything for backward compatibility
export { COLOR_SCHEMES };
export type { CertificateData, CertificateColors };

// Legacy template mapping for existing code
export const CERTIFICATE_TEMPLATES = [
	{
		id: 'template-1',
		name: 'Classic Blue',
		description: 'Professional blue gradient design',
		colors: COLOR_SCHEMES.blue,
		style: 'classic',
		preview: 'bg-gradient-to-br from-blue-50 to-blue-100',
	},
	{
		id: 'template-2',
		name: 'Elegant Purple',
		description: 'Sophisticated purple theme',
		colors: COLOR_SCHEMES.purple,
		style: 'elegant',
		preview: 'bg-gradient-to-br from-purple-50 to-purple-100',
	},
	{
		id: 'template-3',
		name: 'Modern Green',
		description: 'Fresh green modern design',
		colors: COLOR_SCHEMES.green,
		style: 'modern',
		preview: 'bg-gradient-to-br from-green-50 to-green-100',
	},
	{
		id: 'template-4',
		name: 'Warm Orange',
		description: 'Vibrant orange energy theme',
		colors: COLOR_SCHEMES.orange,
		style: 'warm',
		preview: 'bg-gradient-to-br from-orange-50 to-orange-100',
	},
	{
		id: 'template-5',
		name: 'Royal Gold',
		description: 'Luxurious gold premium design',
		colors: COLOR_SCHEMES.gold,
		style: 'royal',
		preview: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
	},
];
