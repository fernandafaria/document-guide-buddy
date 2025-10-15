import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export const MapLegend = () => {
  const legendItems = [
    {
      icon: (
        <div className="w-5 h-5 rounded-full bg-[#FF5722] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
          3
        </div>
      ),
      label: "Check-ins ativos",
    },
    {
      icon: <div className="w-4 h-4 rounded-full bg-[#9b87f5] border-2 border-white"></div>,
      label: "Locais disponíveis",
    },
    {
      icon: <div className="w-4 h-4 rounded-full bg-[#4ECDC4] border-2 border-white"></div>,
      label: "Você está aqui",
    },
  ];

  return (
    <>
      {/* Desktop: Card com legenda completa */}
      <Card className="hidden md:block absolute top-4 left-4 z-20 p-3 shadow-lg">
        <h3 className="text-sm font-semibold mb-2">Legenda</h3>
        <div className="space-y-2 text-xs">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Mobile: Botão flutuante com popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="md:hidden fixed top-4 left-4 z-20 h-12 w-12 rounded-full shadow-lg bg-white hover:bg-gray-100 text-black-soft"
          >
            <Info className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="bottom" 
          align="start" 
          className="w-64 p-4"
        >
          <h3 className="text-base font-bold mb-3">Legenda</h3>
          <div className="space-y-3">
            {legendItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
