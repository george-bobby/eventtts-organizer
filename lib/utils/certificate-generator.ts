// Certificate Generation Utilities using html2canvas and jsPDF

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface CertificateGenerationOptions {
	format?: 'pdf' | 'png' | 'jpeg';
	quality?: number;
	scale?: number;
	width?: number;
	height?: number;
}

export interface GeneratedCertificate {
	blob: Blob;
	dataUrl: string;
	filename: string;
}

/**
 * Generate certificate from HTML element using html2canvas
 */
export const generateCertificateFromElement = async (
	element: HTMLElement,
	options: CertificateGenerationOptions = {}
): Promise<GeneratedCertificate> => {
	const {
		format = 'pdf',
		quality = 0.95,
		scale = 2,
		width = 800,
		height = 600,
	} = options;

	try {
		// Generate canvas from HTML element
		const canvas = await html2canvas(element, {
			useCORS: true,
			allowTaint: false,
			backgroundColor: '#ffffff',
			width,
			height,
			logging: false,
		} as any);

		if (format === 'pdf') {
			return generatePDFFromCanvas(canvas, quality);
		} else {
			return generateImageFromCanvas(canvas, format as 'png' | 'jpeg', quality);
		}
	} catch (error) {
		console.error('Error generating certificate:', error);
		throw new Error('Failed to generate certificate');
	}
};

/**
 * Generate certificate from HTML string
 */
export const generateCertificateFromHTML = async (
	htmlString: string,
	options: CertificateGenerationOptions = {}
): Promise<GeneratedCertificate> => {
	return new Promise((resolve, reject) => {
		// Create a temporary iframe to render the HTML
		const iframe = document.createElement('iframe');
		iframe.style.position = 'absolute';
		iframe.style.left = '-9999px';
		iframe.style.width = '800px';
		iframe.style.height = '600px';
		iframe.style.border = 'none';

		document.body.appendChild(iframe);

		iframe.onload = async () => {
			try {
				const iframeDoc =
					iframe.contentDocument || iframe.contentWindow?.document;
				if (!iframeDoc) {
					throw new Error('Could not access iframe document');
				}

				// Wait a bit for fonts and styles to load
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const certificateElement = iframeDoc.querySelector(
					'#certificate'
				) as HTMLElement;
				if (!certificateElement) {
					throw new Error('Certificate element not found');
				}

				const result = await generateCertificateFromElement(
					certificateElement,
					options
				);
				document.body.removeChild(iframe);
				resolve(result);
			} catch (error) {
				document.body.removeChild(iframe);
				reject(error);
			}
		};

		iframe.onerror = () => {
			document.body.removeChild(iframe);
			reject(new Error('Failed to load iframe'));
		};

		// Set the HTML content
		iframe.srcdoc = htmlString;
	});
};

/**
 * Generate PDF from canvas
 */
const generatePDFFromCanvas = (
	canvas: HTMLCanvasElement,
	quality: number
): GeneratedCertificate => {
	const imgData = canvas.toDataURL('image/png', quality);

	// Create PDF in landscape orientation to fit certificate
	const pdf = new jsPDF({
		orientation: 'landscape',
		unit: 'mm',
		format: 'a4',
	});

	// Calculate dimensions to fit the certificate
	const pdfWidth = pdf.internal.pageSize.getWidth();
	const pdfHeight = pdf.internal.pageSize.getHeight();

	const canvasAspectRatio = canvas.width / canvas.height;
	const pdfAspectRatio = pdfWidth / pdfHeight;

	let imgWidth, imgHeight;

	if (canvasAspectRatio > pdfAspectRatio) {
		// Canvas is wider, fit to width
		imgWidth = pdfWidth;
		imgHeight = pdfWidth / canvasAspectRatio;
	} else {
		// Canvas is taller, fit to height
		imgHeight = pdfHeight;
		imgWidth = pdfHeight * canvasAspectRatio;
	}

	// Center the image
	const x = (pdfWidth - imgWidth) / 2;
	const y = (pdfHeight - imgHeight) / 2;

	pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

	const pdfBlob = pdf.output('blob');
	const filename = `certificate-${Date.now()}.pdf`;

	return {
		blob: pdfBlob,
		dataUrl: imgData,
		filename,
	};
};

/**
 * Generate image from canvas
 */
const generateImageFromCanvas = (
	canvas: HTMLCanvasElement,
	format: 'png' | 'jpeg',
	quality: number
): Promise<GeneratedCertificate> => {
	return new Promise((resolve, reject) => {
		const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
		const dataUrl = canvas.toDataURL(mimeType, quality);

		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error('Failed to generate image blob'));
					return;
				}

				const filename = `certificate-${Date.now()}.${format}`;

				resolve({
					blob,
					dataUrl,
					filename,
				});
			},
			mimeType,
			quality
		);
	});
};

/**
 * Download generated certificate
 */
export const downloadCertificate = (
	certificate: GeneratedCertificate
): void => {
	const url = URL.createObjectURL(certificate.blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = certificate.filename;
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(url);
	document.body.removeChild(a);
};

/**
 * Generate multiple certificates and create a ZIP file
 */
export const generateCertificateZip = async (
	certificates: { html: string; filename: string }[],
	options: CertificateGenerationOptions = {}
): Promise<Blob> => {
	const JSZip = (await import('jszip')).default;
	const zip = new JSZip();

	for (const cert of certificates) {
		try {
			const generated = await generateCertificateFromHTML(cert.html, options);
			const filename = cert.filename.replace(
				/\.(html|htm)$/i,
				`.${options.format || 'pdf'}`
			);
			zip.file(filename, generated.blob);
		} catch (error) {
			console.error(`Error generating certificate ${cert.filename}:`, error);
			// Continue with other certificates
		}
	}

	return zip.generateAsync({ type: 'blob' });
};

/**
 * Utility to check if html2canvas is supported
 */
export const isHtml2CanvasSupported = (): boolean => {
	try {
		return (
			typeof html2canvas !== 'undefined' && typeof document !== 'undefined'
		);
	} catch {
		return false;
	}
};

/**
 * Preload fonts for better rendering
 */
export const preloadFonts = async (fontUrls: string[]): Promise<void> => {
	const fontPromises = fontUrls.map((url) => {
		return new Promise<void>((resolve, reject) => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = url;
			link.onload = () => resolve();
			link.onerror = () => reject(new Error(`Failed to load font: ${url}`));
			document.head.appendChild(link);
		});
	});

	await Promise.all(fontPromises);

	// Wait a bit more for fonts to be applied
	await new Promise((resolve) => setTimeout(resolve, 500));
};
