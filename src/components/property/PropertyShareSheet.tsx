import { useState } from "react";
import { Share2, MessageCircle, Copy, Link2, Twitter, Facebook, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { shareProperty, copyPropertyLink, getPropertyShareUrl, getPropertyUrl } from "@/utils/shareUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PropertyShareSheetProps {
  propertyId: string;
  propertyTitle: string;
  price?: string;
  location?: string;
  imageUrl?: string;
  triggerClassName?: string;
  triggerVariant?: "outline" | "ghost" | "default" | "secondary";
  triggerSize?: "sm" | "default" | "lg" | "icon";
  showLabel?: boolean;
}

interface ShareOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void | Promise<void>;
}

export function PropertyShareSheet({
  propertyId,
  propertyTitle,
  price,
  location,
  imageUrl,
  triggerClassName,
  triggerVariant = "outline",
  triggerSize = "sm",
  showLabel = true,
}: PropertyShareSheetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const ogUrl = getPropertyShareUrl(propertyId);
  const directUrl = getPropertyUrl(propertyId);

  const buildText = () => {
    const lines = [`🏠 *${propertyTitle}*`];
    if (price) lines.push(`💰 ${price}`);
    if (location) lines.push(`📍 ${location}`);
    lines.push("", `View listing: ${ogUrl}`);
    return lines.join("\n");
  };

  const handleCopyLink = async () => {
    await copyPropertyLink(propertyId);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions: ShareOption[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      description: "Share with contacts or to your Status",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: "text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20",
      action: () => {
        const text = encodeURIComponent(buildText());
        window.open(`https://wa.me/?text=${text}`, "_blank");
        setOpen(false);
      },
    },
    {
      id: "twitter",
      label: "X (Twitter)",
      description: "Post to your X timeline",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: "text-foreground bg-muted hover:bg-muted/80",
      action: () => {
        const text = encodeURIComponent(`${propertyTitle}${price ? ` - ${price}` : ""}${location ? ` in ${location}` : ""}`);
        const url = encodeURIComponent(ogUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
        setOpen(false);
      },
    },
    {
      id: "facebook",
      label: "Facebook",
      description: "Share on your Facebook feed",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: "text-[#1877F2] bg-[#1877F2]/10 hover:bg-[#1877F2]/20",
      action: () => {
        const url = encodeURIComponent(ogUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
        setOpen(false);
      },
    },
    {
      id: "native",
      label: "More Options",
      description: "Share via other installed apps",
      icon: <Share2 className="h-5 w-5" />,
      color: "text-primary bg-primary/10 hover:bg-primary/20",
      action: async () => {
        if (navigator.share) {
          try {
            await shareProperty(propertyTitle, propertyId, { price, location, imageUrl });
            setOpen(false);
          } catch {
            // user cancelled
          }
        } else {
          toast.info("Native sharing not supported on this device");
        }
      },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={cn("gap-2", triggerClassName)}>
          <Share2 className="h-4 w-4" />
          {showLabel && <span className="hidden sm:inline">Share</span>}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left text-lg font-semibold">Share this listing</SheetTitle>
          <p className="text-sm text-muted-foreground text-left line-clamp-1">{propertyTitle}</p>
        </SheetHeader>

        {/* Property preview pill */}
        {(price || location) && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-5">
            {imageUrl && (
              <img src={imageUrl} alt={propertyTitle} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground line-clamp-1">{propertyTitle}</p>
              {price && <p className="text-sm text-primary font-semibold">{price}</p>}
              {location && <p className="text-xs text-muted-foreground line-clamp-1">{location}</p>}
            </div>
          </div>
        )}

        {/* Share options grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors hover:bg-muted group"
            >
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-colors", option.color)}>
                {option.icon}
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Copy link row */}
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="flex-1 text-sm text-muted-foreground truncate">{directUrl}</p>
          <Button
            size="sm"
            variant={copied ? "default" : "outline"}
            onClick={handleCopyLink}
            className={cn("gap-1.5 flex-shrink-0 transition-all", copied && "bg-primary text-primary-foreground")}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
