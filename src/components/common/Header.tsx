import { User } from "@/types";

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="app-title">Smart Supply Chain</h1>
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          {user.avatar && (
            <img src={user.avatar} alt={user.name} className="user-avatar" />
          )}
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;