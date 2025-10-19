'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Download, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  style: string;
  preview: string;
}

interface ColorOption {
  id: string;
  name: string;
  preview: string;
}

interface CertificateData {
  recipientName: string;
  eventName: string;
  organizerName: string;
  certificateType: string;
  eventDate: string;
  role: string;
  certificateId?: string;
}

interface CertificatePreviewProps {
  eventId: string;
  role: string;
  onTemplateSelect?: (templateId: string, colorId: string) => void;
  initialTemplate?: string;
  initialColor?: string;
}

export default function CertificatePreview({
  eventId,
  role,
  onTemplateSelect,
  initialTemplate,
  initialColor,
}: CertificatePreviewProps) {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplate || '');
  const [selectedColor, setSelectedColor] = useState<string>(initialColor || '');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const { toast } = useToast();

  // Load templates and colors on component mount
  useEffect(() => {
    loadTemplatesAndColors();
  }, []);

  // Generate preview when template or color changes
  useEffect(() => {
    if (selectedTemplate && selectedColor) {
      generatePreview();
      onTemplateSelect?.(selectedTemplate, selectedColor);
    }
  }, [selectedTemplate, selectedColor]);

  const loadTemplatesAndColors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/certificates/preview?includePreview=true&role=${role}`);
      const result = await response.json();

      if (response.ok) {
        setTemplates(result.data.templates);
        setColors(result.data.colors);
        
        // Set default selections if not provided
        if (!selectedTemplate && result.data.templates.length > 0) {
          setSelectedTemplate(result.data.templates[0].id);
        }
        if (!selectedColor && result.data.colors.length > 0) {
          setSelectedColor(result.data.colors[0].id);
        }
      } else {
        throw new Error(result.error || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificate templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!selectedTemplate || !selectedColor) return;

    try {
      setIsGeneratingPreview(true);
      const response = await fetch('/api/certificates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          colorId: selectedColor,
          useSampleData: true,
          certificateData: { role },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPreviewHtml(result.data.html);
      } else {
        throw new Error(result.error || 'Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate certificate preview',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const downloadPreview = () => {
    if (!previewHtml) return;

    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-preview-${selectedTemplate}-${selectedColor}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Success',
      description: 'Certificate preview downloaded successfully',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading certificate templates...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template and Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Certificate Template Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Style</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-gray-500">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Color Scheme</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color.preview}`} />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Template Info */}
          {selectedTemplate && selectedColor && (
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline">
                {templates.find(t => t.id === selectedTemplate)?.name}
              </Badge>
              <Badge variant="outline">
                {colors.find(c => c.id === selectedColor)?.name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Certificate Preview
            </div>
            <Button
              onClick={downloadPreview}
              disabled={!previewHtml || isGeneratingPreview}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Preview
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGeneratingPreview ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Generating preview...</span>
            </div>
          ) : previewHtml ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-96 border-0"
                title="Certificate Preview"
              />
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              Select a template and color to see the preview
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
