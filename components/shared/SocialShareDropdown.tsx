"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share, MessageCircle, Send, Mail, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareDropdownProps {
  shareUrl: string;
  title: string;
  description?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export default function SocialShareDropdown({
  shareUrl,
  title,
  description = "",
  size = "sm",
  variant = "outline",
  className = "",
}: SocialShareDropdownProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Shareable link copied to clipboard",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `${title}\n\n${description}\n\nView gallery: ${shareUrl}`,
    );
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(`${title}\n\n${description}`);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
    window.open(telegramUrl, "_blank");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this gallery: ${title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI wanted to share this photo gallery with you:\n\n${title}\n\n${description}\n\nView the gallery here: ${shareUrl}\n\nBest regards`,
    );
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <Share className="h-3 w-3 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={handleWhatsAppShare}
          className="cursor-pointer"
        >
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleTelegramShare}
          className="cursor-pointer"
        >
          <Send className="h-4 w-4 mr-2 text-blue-500" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2 text-gray-600" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2 text-gray-600" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
