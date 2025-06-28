type NavigationTab = 'dashboard' | 'inventory' | 'suppliers' | 'orders' | 'reports';

interface NavigationTabConfig {
  id: NavigationTab;
  label: string;
  icon: string;
  requiredRole?: string[];
}

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  userRole: string;
}

const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  userRole
}) => {
  const tabs: NavigationTabConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏢' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈', requiredRole: ['admin', 'manager'] },
  ];

  const filteredTabs = tabs.filter(tab =>
    !tab.requiredRole || tab.requiredRole.includes(userRole)
  );

  return (
    <nav className="navigation">
      {filteredTabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
};  
export default Navigation;