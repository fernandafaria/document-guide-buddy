import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Locate, ZoomIn, ZoomOut } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterUser: () => void;
}

export const MapControls = ({ onZoomIn, onZoomOut, onCenterUser }: MapControlsProps) => {
  return (
    <Card className="absolute bottom-20 right-4 z-20 p-2 flex flex-col gap-2 shadow-lg">
      <Button
        size="icon"
        variant="secondary"
        onClick={onCenterUser}
        className="h-12 w-12 md:h-10 md:w-10 touch-manipulation"
        title="Centralizar em você"
      >
        <Locate className="h-6 w-6 md:h-5 md:w-5" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={onZoomIn}
        className="h-12 w-12 md:h-10 md:w-10 touch-manipulation"
        title="Aumentar zoom"
      >
        <ZoomIn className="h-6 w-6 md:h-5 md:w-5" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={onZoomOut}
        className="h-12 w-12 md:h-10 md:w-10 touch-manipulation"
        title="Diminuir zoom"
      >
        <ZoomOut className="h-6 w-6 md:h-5 md:w-5" />
      </Button>
    </Card>
  );
};
