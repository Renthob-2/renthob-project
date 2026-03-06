import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className="gap-1.5 text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
