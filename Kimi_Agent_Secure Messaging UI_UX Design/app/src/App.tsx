import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, Sparkles, X } from 'lucide-react';

// Client components
import { ClientSidebar } from '@/components/client/ClientSidebar';
import { ChatList } from '@/components/client/ChatList';
import { ChatWindow } from '@/components/client/ChatWindow';
import { ContactsView } from '@/components/client/ContactsView';
import { SettingsView } from '@/components/client/SettingsView';
import { SecurityView } from '@/components/client/SecurityView';
import { ProfileView } from '@/components/client/ProfileView';
import { AIAssistantView } from '@/components/client/AIAssistantView';
import { RegistrationView } from '@/components/client/RegistrationView';

// Admin components
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardView } from '@/components/admin/DashboardView';
import { UsersManagementView } from '@/components/admin/UsersManagementView';
import { GroupsManagementView } from '@/components/admin/GroupsManagementView';
import { MessagesManagementView } from '@/components/admin/MessagesManagementView';
import { SecurityManagementView } from '@/components/admin/SecurityManagementView';
import { AdminSettingsView } from '@/components/admin/AdminSettingsView';

// Hooks and data
import { 
  useChats, 
  useMessages, 
  useContacts
} from '@/hooks/useAppState';
import { mockUsers } from '@/data/mockData';

// View types
type ViewMode = 'client' | 'admin' | 'register';
type ClientView = 'chats' | 'contacts' | 'calls' | 'ai-assistant' | 'security' | 'profile' | 'settings';
type AdminView = 'dashboard' | 'users' | 'groups' | 'messages' | 'security' | 'settings';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('client');
  const [clientView, setClientView] = useState<ClientView>('chats');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Hooks
  const { chats, activeChat, selectChat } = useChats();
  const { sendMessage, getChatMessages } = useMessages(activeChat?.id);
  const { contacts, blockContact, syncContacts } = useContacts();

  // Check mobile on mount
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Registration complete handler
  const handleRegistrationComplete = () => {
    setViewMode('client');
  };

  // Render client view
  const renderClientView = () => {
    switch (clientView) {
      case 'chats':
        return (
          <>
            {/* Chat list sidebar */}
            <div className={cn(
              'w-full lg:w-80 xl:w-96 border-r border-secure-purple/20',
              activeChat && isMobile && 'hidden'
            )}>
              <ChatList
                chats={chats}
                activeChatId={activeChat?.id}
                onSelectChat={selectChat}
                searchQuery={chatSearchQuery}
                onSearchChange={setChatSearchQuery}
              />
            </div>
            
            {/* Chat window */}
            <div className={cn(
              'flex-1',
              !activeChat && isMobile && 'hidden'
            )}>
              <ChatWindow
                chat={activeChat}
                messages={activeChat ? getChatMessages(activeChat.id) : []}
                onSendMessage={sendMessage}
                onBack={() => selectChat(null)}
                isMobile={isMobile}
              />
            </div>
          </>
        );
      
      case 'contacts':
        return (
          <div className="flex-1">
            <ContactsView
              contacts={contacts}
              onSync={syncContacts}
              onBlock={blockContact}
              onDelete={() => {}}
              onStartChat={() => setClientView('chats')}
            />
          </div>
        );
      
      case 'security':
        return (
          <div className="flex-1">
            <SecurityView userFingerprint={mockUsers[0]?.publicKeyFingerprint || ''} />
          </div>
        );
      
      case 'profile':
        return (
          <div className="flex-1">
            <ProfileView user={{
              name: mockUsers[0]?.name || '',
              phoneNumber: mockUsers[0]?.phoneNumber || '',
              avatar: mockUsers[0]?.avatar,
              status: mockUsers[0]?.status || 'offline',
              statusMessage: mockUsers[0]?.statusMessage || '',
              description: 'Desarrolladora de software'
            }} />
          </div>
        );
      
      case 'settings':
        return (
          <div className="flex-1">
            <SettingsView onLogout={() => setViewMode('register')} />
          </div>
        );
      
      case 'ai-assistant':
        return (
          <div className="flex-1">
            <AIAssistantView />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render admin view
  const renderAdminView = () => {
    switch (adminView) {
      case 'dashboard':
        return <DashboardView />;
      case 'users':
        return <UsersManagementView />;
      case 'groups':
        return <GroupsManagementView />;
      case 'messages':
        return <MessagesManagementView />;
      case 'security':
        return <SecurityManagementView />;
      case 'settings':
        return <AdminSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // Registration view
  if (viewMode === 'register') {
    return <RegistrationView onComplete={handleRegistrationComplete} />;
  }

  return (
    <div className="min-h-screen bg-secure-black text-white">
      {/* View mode switcher (for demo) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <div className="bg-secure-gray-dark/90 backdrop-blur-xl border border-secure-purple/30 rounded-xl p-1 flex items-center gap-1">
          <button
            onClick={() => setViewMode('client')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              viewMode === 'client' 
                ? 'bg-secure-lilac text-secure-black' 
                : 'text-gray-400 hover:text-white'
            )}
          >
            Cliente
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              viewMode === 'admin' 
                ? 'bg-red-500 text-white' 
                : 'text-gray-400 hover:text-white'
            )}
          >
            Admin
          </button>
        </div>
      </div>

      {viewMode === 'client' ? (
        <div className="flex h-screen">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-secure-gray-dark/90 backdrop-blur-xl border border-secure-purple/30 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Sidebar */}
          <ClientSidebar
            activeView={clientView}
            onViewChange={(view) => setClientView(view as ClientView)}
            currentUser={{
              name: mockUsers[0]?.name || 'Usuario',
              avatar: mockUsers[0]?.avatar,
              status: mockUsers[0]?.statusMessage || 'Disponible',
            }}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main content */}
          <main className="flex-1 flex overflow-hidden lg:ml-0">
            {renderClientView()}
          </main>

          {/* Floating AI Assistant button */}
          {clientView !== 'ai-assistant' && (
            <>
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={cn(
                  'fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all z-40',
                  'bg-gradient-to-r from-secure-lilac to-secure-lilac-dim',
                  'hover:shadow-glow-lilac-lg hover:scale-110',
                  showAIAssistant && 'rotate-45'
                )}
              >
                {showAIAssistant ? (
                  <X className="w-6 h-6 text-secure-black" />
                ) : (
                  <Sparkles className="w-6 h-6 text-secure-black" />
                )}
              </button>

              {/* AI Assistant floating panel */}
              {showAIAssistant && (
                <AIAssistantView 
                  isFloating 
                  onClose={() => setShowAIAssistant(false)} 
                />
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex h-screen">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-secure-gray-dark/90 backdrop-blur-xl border border-secure-purple/30 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Admin Sidebar */}
          <AdminSidebar
            activeView={adminView}
            onViewChange={(view) => setAdminView(view as AdminView)}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main content */}
          <main className="flex-1 overflow-hidden lg:ml-0">
            {renderAdminView()}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
