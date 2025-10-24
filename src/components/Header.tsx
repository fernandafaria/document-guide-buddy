import { NotificationBell } from "./NotificationBell";

const Header = () => {
  return (
    <div className="w-full py-4 px-4 flex items-center justify-between bg-background border-b border-border">
      <div className="w-10" />
      <h1 className="text-5xl font-fredoka font-bold text-coral tracking-tight">
        Yo!
      </h1>
      <NotificationBell />
    </div>
  );
};

export default Header;
