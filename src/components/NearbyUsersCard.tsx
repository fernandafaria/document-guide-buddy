import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  profession: string | null;
  photos: string[];
}

interface NearbyUsersCardProps {
  users: NearbyUser[];
}

export const NearbyUsersCard = ({ users }: NearbyUsersCardProps) => {
  const navigate = useNavigate();

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-medium text-lg">Nenhum usuário ativo aqui ainda</p>
        <p className="text-gray-medium text-sm mt-2">Seja o primeiro! 👋</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <Card
          key={user.id}
          className="p-4 cursor-pointer hover:shadow-elevated transition-all hover:scale-[1.02] animate-fade-in border-2 hover:border-primary/30"
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                <AvatarImage src={user.photos[0]} alt={user.name} />
                <AvatarFallback className="bg-gradient-primary text-white text-xl">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-mint-green rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-lg text-gray-dark">{user.name}</h4>
                <Badge variant="secondary" className="text-sm font-semibold">
                  {user.age}
                </Badge>
              </div>
              {user.profession && (
                <p className="text-sm text-gray-medium flex items-center gap-1">
                  💼 {user.profession}
                </p>
              )}
            </div>
            <div className="text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
