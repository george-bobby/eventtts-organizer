"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Mail, Users, Award, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface SimpleCertificateManagementProps {
  eventId: string;
  stakeholders: any[];
}

interface Template {
  id: string;
  name: string;
  description: string;
}

interface ColorScheme {
  id: string;
  name: string;
  preview: string;
}

const ROLES = [
  {
    id: "participant",
    name: "Participant",
    icon: <Award className="h-5 w-5" />,
  },
  { id: "volunteer", name: "Volunteer", icon: <Users className="h-5 w-5" /> },
  { id: "speaker", name: "Speaker", icon: <FileText className="h-5 w-5" /> },
];

export default function SimpleCertificateManagement({
  eventId,
  stakeholders,
}: SimpleCertificateManagementProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [colors, setColors] = useState<ColorScheme[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<
    Record<string, string>
  >({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(
    {},
  );
  const [previewHtml, setPreviewHtml] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isDistributing, setIsDistributing] = useState<Record<string, boolean>>(
    {},
  );
  const { toast } = useToast();
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Load templates and colors on mount
  useEffect(() => {
    loadTemplatesAndColors();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const loadTemplatesAndColors = async () => {
    try {
      const response = await fetch("/api/certificates/preview");
      const result = await response.json();

      if (response.ok) {
        setTemplates(result.data.templates);
        setColors(result.data.colors);

        // Set default selections
        const defaultTemplate = result.data.templates[0]?.id || "";
        const defaultColor = result.data.colors[0]?.id || "";

        const defaultTemplates: Record<string, string> = {};
        const defaultColors: Record<string, string> = {};

        ROLES.forEach((role) => {
          defaultTemplates[role.id] = defaultTemplate;
          defaultColors[role.id] = defaultColor;
        });

        setSelectedTemplates(defaultTemplates);
        setSelectedColors(defaultColors);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load certificate templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate preview for a specific role
  const generatePreview = async (role: string) => {
    const templateId = selectedTemplates[role];
    const colorId = selectedColors[role];

    if (!templateId || !colorId) return;

    try {
      const response = await fetch("/api/certificates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          colorId,
          useSampleData: true,
          certificateData: { role },
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setPreviewHtml((prev) => ({ ...prev, [role]: result.data.html }));
      }
    } catch (error) {
      console.error("Error generating preview:", error);
    }
  };

  // Handle template selection with debouncing
  const handleTemplateChange = (role: string, templateId: string) => {
    setSelectedTemplates((prev) => {
      if (prev[role] === templateId) return prev; // Prevent unnecessary updates
      return { ...prev, [role]: templateId };
    });

    // Clear existing timer
    if (debounceTimers.current[role]) {
      clearTimeout(debounceTimers.current[role]);
    }

    // Set new timer
    debounceTimers.current[role] = setTimeout(() => {
      generatePreview(role);
    }, 500);
  };

  // Handle color selection with debouncing
  const handleColorChange = (role: string, colorId: string) => {
    setSelectedColors((prev) => {
      if (prev[role] === colorId) return prev; // Prevent unnecessary updates
      return { ...prev, [role]: colorId };
    });

    // Clear existing timer
    if (debounceTimers.current[role]) {
      clearTimeout(debounceTimers.current[role]);
    }

    // Set new timer
    debounceTimers.current[role] = setTimeout(() => {
      generatePreview(role);
    }, 500);
  };

  // Generate and download all certificates for a role
  const handleBulkDownload = async (role: string) => {
    setIsGenerating((prev) => ({ ...prev, [role]: true }));

    try {
      const templateId = selectedTemplates[role];
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          role,
          templateId,
          action: "download",
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${role}_certificates.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: `${role} certificates downloaded successfully`,
        });
      } else {
        throw new Error("Failed to generate certificates");
      }
    } catch (error) {
      console.error("Error downloading certificates:", error);
      toast({
        title: "Error",
        description: "Failed to download certificates",
        variant: "destructive",
      });
    } finally {
      setIsGenerating((prev) => ({ ...prev, [role]: false }));
    }
  };

  // Distribute certificates via email
  const handleEmailDistribution = async (role: string) => {
    setIsDistributing((prev) => ({ ...prev, [role]: true }));

    try {
      const templateId = selectedTemplates[role];
      const response = await fetch("/api/certificates/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          role,
          templateId,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: `Certificates distributed to ${result.emailsSent} ${role}s`,
        });
      } else {
        throw new Error(result.error || "Failed to distribute certificates");
      }
    } catch (error) {
      console.error("Error distributing certificates:", error);
      toast({
        title: "Error",
        description: "Failed to distribute certificates via email",
        variant: "destructive",
      });
    } finally {
      setIsDistributing((prev) => ({ ...prev, [role]: false }));
    }
  };

  // Get count of users for a role
  const getRoleCount = (role: string) => {
    return stakeholders.filter((s) => s.role === role).length;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ROLES.map((role) => (
          <Card key={role.id} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {role.icon}
                {role.name} Certificates
              </CardTitle>
              <p className="text-sm text-gray-600">
                {getRoleCount(role.id)} {role.id}s registered
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Certificate Template
                </label>
                <Select
                  value={selectedTemplates[role.id] || ""}
                  onValueChange={(value) =>
                    handleTemplateChange(role.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Color Scheme</label>
                <Select
                  value={selectedColors[role.id] || ""}
                  onValueChange={(value) => handleColorChange(role.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full ${color.preview}`}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div
                  className="border rounded-lg overflow-hidden bg-white relative"
                  style={{ height: "300px" }}
                >
                  {previewHtml[role.id] ? (
                    <>
                      <iframe
                        srcDoc={previewHtml[role.id]}
                        className="w-full h-full border-0"
                        title={`${role.name} Certificate Preview`}
                        style={{
                          transform: "scale(0.3)",
                          transformOrigin: "top left",
                          width: "333%",
                          height: "333%",
                        }}
                      />
                      <div
                        ref={(el) => {
                          previewRefs.current[role.id] = el;
                        }}
                        dangerouslySetInnerHTML={{
                          __html: previewHtml[role.id],
                        }}
                        className="absolute top-0 left-0 opacity-0 pointer-events-none"
                        style={{ width: "1000px", height: "700px" }}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Select template and color to see preview
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleBulkDownload(role.id)}
                  disabled={
                    isGenerating[role.id] || getRoleCount(role.id) === 0
                  }
                  className="w-full"
                  size="sm"
                >
                  {isGenerating[role.id] ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download All ({getRoleCount(role.id)})
                </Button>

                <Button
                  onClick={() => handleEmailDistribution(role.id)}
                  disabled={
                    isDistributing[role.id] || getRoleCount(role.id) === 0
                  }
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {isDistributing[role.id] ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Email All ({getRoleCount(role.id)})
                </Button>
              </div>

              {getRoleCount(role.id) === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No {role.id}s registered for this event
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
