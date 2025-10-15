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
      <h3 className="font-bold text-lg mb-4">Pessoas ativas aqui ({users.length})</h3>
      {users.map((user) => (
        <Card
          key={user.id}
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.photos[0]} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-base">{user.name}</h4>
                <Badge variant="secondary">{user.age}</Badge>
              </div>
              {user.profession && (
                <p className="text-sm text-gray-medium mt-1">{user.profession}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
