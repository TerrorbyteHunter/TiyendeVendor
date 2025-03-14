import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  Map, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  X, 
  Bus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPath: string;
}

export function Sidebar({ isOpen, toggleSidebar, currentPath }: SidebarProps) {
  const { vendor, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside 
      className={`bg-gray-900 text-white w-full md:w-64 md:flex md:flex-col md:min-h-screen transition-all duration-300 fixed md:relative z-50 transform md:transform-none ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-primary p-1.5 rounded">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">Tiyende Vendor</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="md:hidden text-white"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="px-4 py-2">
        <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={vendor?.profileImage} alt={vendor?.name} />
            <AvatarFallback className="bg-primary">{vendor?.name?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{vendor?.name}</p>
            <p className="text-xs text-gray-400">{vendor?.email}</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="mt-4">
          <div className="px-4 py-2">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Main</h2>
            <ul className="mt-2 space-y-1">
              <SidebarItem 
                href="/" 
                icon={<Home className="h-5 w-5" />} 
                label="Dashboard" 
                isActive={currentPath === '/'} 
              />
              <SidebarItem 
                href="/routes" 
                icon={<Map className="h-5 w-5" />} 
                label="Routes" 
                isActive={currentPath === '/routes'} 
              />
              <SidebarItem 
                href="/schedule" 
                icon={<Calendar className="h-5 w-5" />} 
                label="Schedule Trips" 
                isActive={currentPath === '/schedule'} 
              />
              <SidebarItem 
                href="/bookings" 
                icon={<BookOpen className="h-5 w-5" />} 
                label="Bookings" 
                isActive={currentPath === '/bookings'} 
              />
              <SidebarItem 
                href="/payments" 
                icon={<CreditCard className="h-5 w-5" />} 
                label="Payments" 
                isActive={currentPath === '/payments'} 
              />
            </ul>
          </div>
          
          <div className="px-4 py-2 mt-4">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Account</h2>
            <ul className="mt-2 space-y-1">
              <SidebarItem 
                href="/profile" 
                icon={<User className="h-5 w-5" />} 
                label="Profile" 
                isActive={currentPath === '/profile'} 
              />
              <SidebarItem 
                href="/settings" 
                icon={<Settings className="h-5 w-5" />} 
                label="Settings" 
                isActive={currentPath === '/settings'} 
              />
              <SidebarItem 
                href="/help" 
                icon={<HelpCircle className="h-5 w-5" />} 
                label="Help & Support" 
                isActive={currentPath === '/help'} 
              />
            </ul>
          </div>
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white w-full"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function SidebarItem({ href, icon, label, isActive }: SidebarItemProps) {
  return (
    <li>
      <Link href={href}>
        <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}>
          <span className="mr-3">{icon}</span>
          {label}
        </a>
      </Link>
    </li>
  );
}
