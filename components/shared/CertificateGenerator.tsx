'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileImage, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateCertificateFromHTML,
  downloadCertificate,
  isHtml2CanvasSupported,
  preloadFonts,
  CertificateGenerationOptions
} from '@/lib/utils/certificate-generator';

interface CertificateGeneratorProps {
  htmlContent: string;
  filename?: string;
  certificateData?: {
    recipientName: string;
    eventName: string;
    role: string;
  };
}

export default function CertificateGenerator({
  htmlContent,
  filename = 'certificate',
  certificateData,
}: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'png' | 'jpeg'>('pdf');
  const [quality, setQuality] = useState(0.95);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  // Check if html2canvas is supported
  const isSupported = isHtml2CanvasSupported();

  const handleGenerate = async () => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Certificate generation is not supported in this environment',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Preload fonts for better rendering
      const fontUrls = [
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Dancing+Script:wght@400;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&family=Merriweather:wght@400;700&display=swap',
      ];

      await preloadFonts(fontUrls);

      const options: CertificateGenerationOptions = {
        format,
        quality,
        scale: 2,
        width: 800,
        height: 600,
      };

      const certificate = await generateCertificateFromHTML(htmlContent, options);
      downloadCertificate(certificate);

      toast({
        title: 'Success',
        description: `Certificate generated and downloaded as ${certificate.filename}`,
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate certificate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewGenerate = async () => {
    if (!previewRef.current) return;

    try {
      setIsGenerating(true);

      const options: CertificateGenerationOptions = {
        format,
        quality,
        scale: 2,
        width: 800,
        height: 600,
      };

      // Find the certificate element in the preview
      const certificateElement = previewRef.current.querySelector('#certificate') as HTMLElement;
      if (!certificateElement) {
        throw new Error('Certificate element not found in preview');
      }

      const { generateCertificateFromElement } = await import('@/lib/utils/certificate-generator');
      const certificate = await generateCertificateFromElement(certificateElement, options);
      downloadCertificate(certificate);

      toast({
        title: 'Success',
        description: `Certificate generated and downloaded as ${certificate.filename}`,
      });

    } catch (error) {
      console.error('Error generating certificate from preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate certificate from preview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Certificate generation is not available in this environment.</p>
            <p className="text-sm mt-2">Please use a modern browser with JavaScript enabled.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Certificate Generation Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <Select value={format} onValueChange={(value: 'pdf' | 'png' | 'jpeg') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="png">PNG Image</SelectItem>
                  <SelectItem value="jpeg">JPEG Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <Select value={quality.toString()} onValueChange={(value) => setQuality(parseFloat(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.8">Standard (80%)</SelectItem>
                  <SelectItem value="0.9">High (90%)</SelectItem>
                  <SelectItem value="0.95">Very High (95%)</SelectItem>
                  <SelectItem value="1.0">Maximum (100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Certificate Info */}
          {certificateData && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline">{certificateData.recipientName}</Badge>
              <Badge variant="outline">{certificateData.eventName}</Badge>
              <Badge variant="outline">{certificateData.role}</Badge>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Generate & Download {format.toUpperCase()}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {htmlContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Certificate Preview</span>
              <Button
                onClick={handlePreviewGenerate}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Generate from Preview
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={previewRef}
              className="border rounded-lg overflow-hidden bg-white"
            >
              <iframe
                srcDoc={htmlContent}
                className="w-full h-96 border-0"
                title="Certificate Preview"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
