import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  generateCertificateHTML,
  getSampleCertificateData,
  getTemplateById,
  getColorSchemeById,
  validateCertificateData
} from '@/lib/constants/certificate-template-manager';

/**
 * POST /api/certificates/preview - Generate certificate preview
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      templateId, 
      colorId, 
      certificateData,
      useSampleData = false 
    } = body;

    if (!templateId || !colorId) {
      return NextResponse.json(
        { error: 'Template ID and Color ID are required' },
        { status: 400 }
      );
    }

    // Validate template and color exist
    const template = getTemplateById(templateId);
    const colors = getColorSchemeById(colorId);

    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}` },
        { status: 404 }
      );
    }

    if (!colors) {
      return NextResponse.json(
        { error: `Color scheme not found: ${colorId}` },
        { status: 404 }
      );
    }

    // Use sample data or provided data
    let data;
    if (useSampleData) {
      data = getSampleCertificateData(certificateData?.role || 'participant');
    } else {
      if (!certificateData) {
        return NextResponse.json(
          { error: 'Certificate data is required when not using sample data' },
          { status: 400 }
        );
      }

      // Validate certificate data
      const validationErrors = validateCertificateData(certificateData);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Invalid certificate data', details: validationErrors },
          { status: 400 }
        );
      }

      data = certificateData;
    }

    // Generate HTML
    const html = generateCertificateHTML(templateId, colorId, data);

    return NextResponse.json({
      success: true,
      data: {
        html,
        template: {
          id: templateId,
          name: template.name,
          description: template.description,
        },
        colors: {
          id: colorId,
          scheme: colors,
        },
        certificateData: data,
      },
    });

  } catch (error) {
    console.error('Error generating certificate preview:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate certificate preview',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/certificates/preview - Get available templates and colors
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includePreview = searchParams.get('includePreview') === 'true';
    const role = searchParams.get('role') || 'participant';

    // Import here to avoid circular dependencies
    const { CERTIFICATE_TEMPLATES_NEW, COLOR_OPTIONS, getAllTemplateOptions } = 
      await import('@/lib/constants/certificate-template-manager');

    const response: any = {
      success: true,
      data: {
        templates: CERTIFICATE_TEMPLATES_NEW.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          style: template.style,
          preview: template.preview,
        })),
        colors: COLOR_OPTIONS,
        combinations: getAllTemplateOptions(),
      },
    };

    // Include sample preview if requested
    if (includePreview) {
      const sampleData = getSampleCertificateData(role);
      response.data.sampleData = sampleData;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error getting certificate templates:', error);
    return NextResponse.json(
      {
        error: 'Failed to get certificate templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
