import { NotificationBell } from "./NotificationBell";

const Header = () => {
  return (
    <div 
      className="w-full px-4 flex items-center justify-between bg-background border-b border-border"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingBottom: '16px',
      }}
    >
      <div className="w-10" />
      <h1 className="text-5xl font-fredoka font-bold text-coral tracking-tight">
        Yo!
      </h1>
      <NotificationBell />
    </div>
  );
};

export default Header;