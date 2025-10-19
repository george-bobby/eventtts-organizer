'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Download, Send, Award, Loader2, Users, FileText, Mail, Eye, Wand2 } from 'lucide-react';
import CertificatePreview from './CertificatePreview';
import CertificateGenerator from './CertificateGenerator';

interface CertificateManagementProps {
  eventId: string;
  templates: any[];
  stakeholders: any[];
}

// Predefined certificate templates
const CERTIFICATE_TEMPLATES = [
  {
    id: 'template-1',
    name: 'Classic Blue',
    description: 'Professional blue gradient design',
    preview: 'bg-gradient-to-br from-blue-600 to-blue-800'
  },
  {
    id: 'template-2',
    name: 'Elegant Purple',
    description: 'Sophisticated purple theme',
    preview: 'bg-gradient-to-br from-purple-600 to-purple-800'
  },
  {
    id: 'template-3',
    name: 'Modern Green',
    description: 'Fresh green modern design',
    preview: 'bg-gradient-to-br from-green-600 to-green-800'
  },
  {
    id: 'template-4',
    name: 'Warm Orange',
    description: 'Vibrant orange energy theme',
    preview: 'bg-gradient-to-br from-orange-600 to-orange-800'
  },
  {
    id: 'template-5',
    name: 'Royal Gold',
    description: 'Luxurious gold premium design',
    preview: 'bg-gradient-to-br from-yellow-600 to-yellow-800'
  }
];

export default function CertificateManagement({
  eventId,
  templates,
  stakeholders,
}: CertificateManagementProps) {
  const [selectedTemplates, setSelectedTemplates] = useState({
    participant: 'template-1',
    volunteer: 'template-2',
    speaker: 'template-3'
  });
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isDistributing, setIsDistributing] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});
  const [previewTemplates, setPreviewTemplates] = useState<Record<string, { templateId: string; colorId: string }>>({});
  const [showGenerator, setShowGenerator] = useState<Record<string, boolean>>({});
  const [generatedHtml, setGeneratedHtml] = useState<Record<string, string>>({});

  const handleGenerateAndDownload = async (role: string) => {
    try {
      setIsGenerating(role);

      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          role,
          templateId: selectedTemplates[role as keyof typeof selectedTemplates],
          action: 'download'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${role}_certificates.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: `${role.charAt(0).toUpperCase() + role.slice(1)} certificates downloaded successfully`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate certificates');
      }
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate certificates',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDistributeViaEmail = async (role: string) => {
    try {
      setIsDistributing(role);

      const response = await fetch('/api/certificates/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          role,
          templateId: selectedTemplates[role as keyof typeof selectedTemplates],
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Failed to distribute certificates');
      }
    } catch (error) {
      console.error('Error distributing certificates:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to distribute certificates',
        variant: 'destructive',
      });
    } finally {
      setIsDistributing(null);
    }
  };

  // Get role counts from stakeholders
  const getRoleCount = (role: string) => {
    return stakeholders.filter(s => s.role === role).length;
  };

  // Handle preview toggle
  const togglePreview = (role: string) => {
    setShowPreview(prev => ({ ...prev, [role]: !prev[role] }));
  };

  // Handle template selection from preview
  const handleTemplateSelect = (role: string, templateId: string, colorId: string) => {
    setPreviewTemplates(prev => ({ ...prev, [role]: { templateId, colorId } }));
    // Update the selected template for the role
    setSelectedTemplates(prev => ({ ...prev, [role]: `${templateId}-${colorId}` }));
  };

  // Handle generator toggle
  const toggleGenerator = (role: string) => {
    setShowGenerator(prev => ({ ...prev, [role]: !prev[role] }));
  };

  // Generate sample certificate HTML for testing
  const generateSampleHtml = async (role: string) => {
    try {
      const response = await fetch('/api/certificates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: previewTemplates[role]?.templateId || 'classic',
          colorId: previewTemplates[role]?.colorId || 'blue',
          useSampleData: true,
          certificateData: { role },
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setGeneratedHtml(prev => ({ ...prev, [role]: result.data.html }));
      }
    } catch (error) {
      console.error('Error generating sample HTML:', error);
    }
  };

  const CertificateSection = ({ role, title, icon }: { role: string; title: string; icon: React.ReactNode }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title} Certificates
        </CardTitle>
        <CardDescription>
          Generate certificates for {getRoleCount(role)} {role}s
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Template</label>
          <Select
            value={selectedTemplates[role as keyof typeof selectedTemplates]}
            onValueChange={(value) =>
              setSelectedTemplates(prev => ({ ...prev, [role]: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose template" />
            </SelectTrigger>
            <SelectContent>
              {CERTIFICATE_TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${template.preview}`}></div>
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Preview */}
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">Template Preview:</div>
          {(() => {
            const template = CERTIFICATE_TEMPLATES.find(t => t.id === selectedTemplates[role as keyof typeof selectedTemplates]);
            return template ? (
              <div className={`h-20 rounded ${template.preview} flex items-center justify-center text-white text-sm font-medium`}>
                {template.name} - {template.description}
              </div>
            ) : null;
          })()}
        </div>

        {/* Preview Button */}
        <Button
          variant="outline"
          onClick={() => togglePreview(role)}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview[role] ? 'Hide Preview' : 'Preview Certificate'}
        </Button>

        {/* Certificate Preview Component */}
        {showPreview[role] && (
          <div className="mt-4">
            <CertificatePreview
              eventId={eventId}
              role={role}
              onTemplateSelect={(templateId, colorId) => handleTemplateSelect(role, templateId, colorId)}
              initialTemplate={previewTemplates[role]?.templateId}
              initialColor={previewTemplates[role]?.colorId}
            />
          </div>
        )}

        {/* Advanced Generator Button */}
        <Button
          variant="outline"
          onClick={() => {
            toggleGenerator(role);
            if (!showGenerator[role]) {
              generateSampleHtml(role);
            }
          }}
          className="w-full"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {showGenerator[role] ? 'Hide Advanced Generator' : 'Advanced Certificate Generator'}
        </Button>

        {/* Certificate Generator Component */}
        {showGenerator[role] && generatedHtml[role] && (
          <div className="mt-4">
            <CertificateGenerator
              htmlContent={generatedHtml[role]}
              filename={`${role}-certificate`}
              certificateData={{
                recipientName: 'Sample User',
                eventName: 'Sample Event',
                role: role,
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleGenerateAndDownload(role)}
            disabled={isGenerating === role || getRoleCount(role) === 0}
            className="flex-1"
          >
            {isGenerating === role ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Auto Generate & Download
          </Button>

          <Button
            variant="outline"
            onClick={() => handleDistributeViaEmail(role)}
            disabled={isDistributing === role || getRoleCount(role) === 0}
            className="flex-1"
          >
            {isDistributing === role ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Distribute via Email
          </Button>
        </div>

        {getRoleCount(role) === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            No {role}s found for this event
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRoleCount('participant')}</div>
            <p className="text-xs text-muted-foreground">Event participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRoleCount('volunteer')}</div>
            <p className="text-xs text-muted-foreground">Event volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speakers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRoleCount('speaker')}</div>
            <p className="text-xs text-muted-foreground">Event speakers</p>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Generation Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CertificateSection
          role="participant"
          title="Participant"
          icon={<Users className="h-5 w-5" />}
        />

        <CertificateSection
          role="volunteer"
          title="Volunteer"
          icon={<Award className="h-5 w-5" />}
        />

        <CertificateSection
          role="speaker"
          title="Speaker"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Certificate Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">1</div>
              <p><strong>Select Template:</strong> Choose from 5 predefined professional certificate templates for each role type.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">2</div>
              <p><strong>Auto Generate & Download:</strong> Generates certificates for all users with that role and downloads them as a ZIP file.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">3</div>
              <p><strong>Distribute via Email:</strong> Generates certificates and automatically sends them to each user via email.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
