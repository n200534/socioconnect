'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolidIcon,
  MagnifyingGlassIcon as SearchSolidIcon,
  BellIcon as BellSolidIcon,
  UserIcon as UserSolidIcon
} from '@heroicons/react/24/solid';
import { Avatar } from '@radix-ui/react-avatar';
import PostModal from '@/components/posts/PostModal';
import { useNotifications } from '@/contexts/NotificationsContext';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon, solidIcon: HomeSolidIcon },
  { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, solidIcon: SearchSolidIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon, solidIcon: BellSolidIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon, solidIcon: UserSolidIcon },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-72 glass animate-slide-in">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SocioConnect
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <nav className="mt-8 px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = isActive ? item.solidIcon : item.icon;
              const showBadge = item.name === 'Notifications' && unreadCount > 0;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl mb-2 transition-all duration-200 relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-medium' 
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="relative">
                    <IconComponent className="h-5 w-5" />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {item.name}
                </Link>
              );
            })}
            
            {/* Post Button - Mobile */}
            <button 
              onClick={() => {
                setPostModalOpen(true);
                setSidebarOpen(false);
              }}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold shadow-medium hover:shadow-large hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Post
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72">
        <div className="flex h-full flex-col glass">
          <div className="flex items-center gap-3 p-6">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SocioConnect
            </h1>
          </div>
          
          <nav className="mt-8 px-4 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = isActive ? item.solidIcon : item.icon;
              const showBadge = item.name === 'Notifications' && unreadCount > 0;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl mb-2 transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-medium' 
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <div className="relative">
                    <IconComponent className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {item.name}
                </Link>
              );
            })}
            
            {/* Post Button */}
            <button 
              onClick={() => setPostModalOpen(true)}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold shadow-medium hover:shadow-large hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Post
            </button>
          </nav>
          
          {/* User profile section */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">@johndoe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 glass border-b border-white/20">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex-1 max-w-2xl mx-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-900" />
                <input
                  type="text"
                  placeholder="Search SocioConnect..."
                  className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/80 transition-all duration-200 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/notifications" className="relative p-2 hover:bg-white/20 rounded-full transition-colors">
                <BellIcon className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Post Modal */}
      <PostModal 
        isOpen={postModalOpen} 
        onClose={() => setPostModalOpen(false)} 
      />
    </div>
  );
}
