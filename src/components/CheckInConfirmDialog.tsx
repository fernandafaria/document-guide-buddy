import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MapPin, Users, Loader2 } from 'lucide-react';

interface CheckInConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  locationName: string;
  locationAddress?: string | null;
  activeUsersCount: number;
  locationType?: string;
  isLoading?: boolean;
}

export const CheckInConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  locationName,
  locationAddress,
  activeUsersCount,
  locationType,
  isLoading = false,
}: CheckInConfirmDialogProps) => {
  const getLocationIcon = () => {
    if (!locationType || locationType === 'user_location') return '📍';
    if (locationType === 'bar' || locationType === 'pub' || locationType === 'nightclub') return '🍺';
    if (locationType === 'restaurant' || locationType === 'cafe') return '🍽️';
    if (locationType === 'park') return '🌳';
    if (locationType === 'sports_centre') return '⚽';
    return '📍';
  };

  const getCategoryName = () => {
    if (!locationType || locationType === 'user_location') return 'Local';
    if (locationType === 'bar' || locationType === 'pub' || locationType === 'nightclub') return 'Bar/Pub';
    if (locationType === 'restaurant' || locationType === 'cafe') return 'Restaurante';
    if (locationType === 'park') return 'Parque';
    if (locationType === 'sports_centre') return 'Centro Esportivo';
    return 'Local';
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md animate-scale-in">
        <AlertDialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="text-5xl animate-bounce-in">{getLocationIcon()}</div>
            <div className="flex-1">
              <AlertDialogTitle className="text-2xl mb-1">
                Fazer check-in?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Confirme seu check-in neste local
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Location Info Card */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
            <h3 className="font-bold text-lg text-gray-dark mb-2">
              {locationName}
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-medium">
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                  {getCategoryName()}
                </span>
              </div>

              {locationAddress && (
                <div className="flex items-center gap-2 text-gray-medium">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{locationAddress}</span>
                </div>
              )}

              {activeUsersCount > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/10">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-primary text-white">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">
                      {activeUsersCount} {activeUsersCount === 1 ? 'pessoa' : 'pessoas'} aqui
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-mint-green/10 rounded-lg p-3 border border-mint-green/20">
            <p className="text-sm text-gray-dark">
              ✨ Você aparecerá para pessoas próximas e poderá descobrir quem está aqui!
            </p>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={isLoading} className="flex-1">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-gradient-primary hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fazendo check-in...
              </>
            ) : (
              'Confirmar Check-in'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
