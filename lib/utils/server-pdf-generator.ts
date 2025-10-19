// Server-side PDF generation using Puppeteer
import puppeteer from 'puppeteer';

export interface ServerPDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
  width?: string;
  height?: string;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  scale?: number;
}

export interface GeneratedPDF {
  buffer: Buffer;
  filename: string;
}

/**
 * Generate PDF from HTML string using Puppeteer (server-side)
 */
export const generatePDFFromHTML = async (
  htmlString: string,
  filename: string,
  options: ServerPDFOptions = {}
): Promise<GeneratedPDF> => {
  const {
    format = 'A4',
    landscape = true, // Default to landscape for certificates
    width = '1000px',
    height = '700px',
    margin = { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground = true,
    scale = 1,
  } = options;

  let browser;
  try {
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: parseInt(width.replace('px', '')),
      height: parseInt(height.replace('px', '')),
      deviceScaleFactor: scale,
    });

    // Set the HTML content
    await page.setContent(htmlString, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: format as any,
      landscape,
      width,
      height,
      margin,
      printBackground,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    return {
      buffer: Buffer.from(pdfBuffer),
      filename: filename.replace(/\.(html|htm)$/i, '.pdf'),
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Generate multiple PDFs from certificate data
 */
export const generateCertificatePDFs = async (
  certificates: { html: string; filename: string }[],
  options: ServerPDFOptions = {}
): Promise<GeneratedPDF[]> => {
  const results: GeneratedPDF[] = [];

  for (const cert of certificates) {
    try {
      const pdf = await generatePDFFromHTML(cert.html, cert.filename, options);
      results.push(pdf);
    } catch (error) {
      console.error(`Error generating PDF for ${cert.filename}:`, error);
      // Continue with other certificates
    }
  }

  return results;
};

/**
 * Generate a single certificate PDF with optimized settings for certificates
 */
export const generateCertificatePDF = async (
  htmlString: string,
  filename: string
): Promise<GeneratedPDF> => {
  return generatePDFFromHTML(htmlString, filename, {
    landscape: true,
    width: '1000px',
    height: '700px',
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground: true,
    scale: 1,
  });
};
