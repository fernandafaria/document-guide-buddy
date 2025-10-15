import { Card } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";

export const MapLegend = () => {
  return (
    <Card className="absolute top-4 left-4 z-20 p-3 shadow-lg">
      <h3 className="text-sm font-semibold mb-2">Legenda</h3>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FF5722] border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">3</div>
          <span>Check-ins ativos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#9b87f5] border border-white"></div>
          <span>Locais disponíveis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4ECDC4] border border-white"></div>
          <span>Você está aqui</span>
        </div>
      </div>
    </Card>
  );
};
