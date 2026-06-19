import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building, Users, FileText, CreditCard, LogOut, Sun, Moon, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/properties', icon: Building },
    { name: 'Tenants', path: '/tenants', icon: Users },
    { name: 'Agreements', path: '/agreements', icon: FileText },
    { name: 'Payments', path: '/payments', icon: CreditCard },
  ];

  // Breadcrumbs calculation
  const pathnames = location.pathname.split('/').filter(x => x);
  const breadcrumbs = pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    return { name: name.charAt(0).toUpperCase() + name.slice(1), path: routeTo, isLast };
  });

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-150px] left-[20%] w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/5 blur-[150px] pointer-events-none z-0" />

      {/* Sidebar */}
      <aside 
        className={`border-r border-border/40 bg-card/60 backdrop-blur-md flex flex-col transition-all duration-300 relative z-10 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Toggle Sidebar Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-card border text-muted-foreground hover:text-foreground rounded-full p-1 shadow-md hover:scale-110 transition-all z-50"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-16`}>
          {!isCollapsed && (
            <h1 className="text-xl font-bold flex items-center gap-2 text-primary tracking-tight">
              <Building className="h-6 w-6 text-primary shrink-0" /> PropManage
            </h1>
          )}
          {isCollapsed && (
            <Building className="h-6 w-6 text-primary shrink-0" />
          )}
        </div>
        
        <nav className="flex-1 px-3 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold backdrop-blur-sm' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
                } ${isCollapsed ? 'justify-center hover:translate-x-0' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer profile & tools */}
        <div className="p-3 border-t border-border/40 mt-auto flex flex-col gap-2 bg-muted/20">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="text-xs max-w-[150px] overflow-hidden">
                <p className="font-semibold truncate">{user?.username}</p>
                <p className="text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
            
            <div className={`flex ${isCollapsed ? 'flex-col gap-2 items-center' : 'gap-1'}`}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="h-8 w-8 rounded-lg"
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                className="h-8 w-8 text-destructive rounded-lg hover:bg-destructive/10 hover:text-destructive"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Header for Breadcrumbs */}
        <header className="h-16 bg-transparent flex items-center px-8 justify-between">
          <nav className="flex text-sm font-medium text-muted-foreground" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link to="/" className="inline-flex items-center hover:text-foreground">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.path} className="flex items-center">
                  <span className="mx-2 text-muted-foreground/40">/</span>
                  <Link 
                    to={crumb.path}
                    className={`hover:text-foreground ${crumb.isLast ? 'text-foreground font-bold pointer-events-none' : ''}`}
                  >
                    {crumb.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-auto bg-transparent">
          <div className="p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
