import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Bell, 
  Shield, 
  Lock, 
  Smartphone, 
  Database,
  Palette,
  ChevronRight,
  LogOut,
  Trash2,
  Key
} from 'lucide-react';

interface SettingsViewProps {
  onLogout: () => void;
}

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: {
    id: string;
    label: string;
    description?: string;
    type: 'toggle' | 'select' | 'button';
    value?: boolean;
    options?: string[];
    icon?: React.ElementType;
    danger?: boolean;
  }[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Use onLogout when needed
  void onLogout;
  
  const [settings, setSettings] = useState({
    notifications: {
      messages: true,
      calls: true,
      groups: true,
      status: false,
    },
    privacy: {
      lastSeen: 'contacts',
      profilePhoto: 'contacts',
      status: 'everyone',
      readReceipts: true,
    },
    security: {
      twoFactorEnabled: true,
      screenLock: false,
    },
    theme: 'dark',
    language: 'es',
  });

  const sections: SettingSection[] = [
    {
      id: 'account',
      title: 'Cuenta',
      icon: User,
      items: [
        { id: 'changeNumber', label: 'Cambiar número', type: 'button', icon: Smartphone },
        { id: 'twoFactor', label: 'Verificación en dos pasos', description: 'Activada', type: 'toggle', value: settings.security.twoFactorEnabled },
        { id: 'logout', label: 'Cerrar sesión', type: 'button', icon: LogOut, danger: true },
        { id: 'deleteAccount', label: 'Eliminar cuenta', type: 'button', icon: Trash2, danger: true },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      icon: Lock,
      items: [
        { id: 'lastSeen', label: 'Última vez', description: 'Mis contactos', type: 'select' },
        { id: 'profilePhoto', label: 'Foto de perfil', description: 'Mis contactos', type: 'select' },
        { id: 'status', label: 'Estados', description: 'Todos', type: 'select' },
        { id: 'readReceipts', label: 'Confirmaciones de lectura', type: 'toggle', value: settings.privacy.readReceipts },
        { id: 'blocked', label: 'Contactos bloqueados', description: '2 contactos', type: 'button' },
      ],
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: Bell,
      items: [
        { id: 'msgNotifications', label: 'Mensajes', type: 'toggle', value: settings.notifications.messages },
        { id: 'callNotifications', label: 'Llamadas', type: 'toggle', value: settings.notifications.calls },
        { id: 'groupNotifications', label: 'Grupos', type: 'toggle', value: settings.notifications.groups },
        { id: 'statusNotifications', label: 'Estados', type: 'toggle', value: settings.notifications.status },
      ],
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: Shield,
      items: [
        { id: 'encryption', label: 'Cifrado de extremo a extremo', description: 'Verificar claves', type: 'button', icon: Key },
        { id: 'devices', label: 'Dispositivos vinculados', description: '3 dispositivos', type: 'button', icon: Smartphone },
        { id: 'screenLock', label: 'Bloqueo de pantalla', type: 'toggle', value: settings.security.screenLock },
      ],
    },
    {
      id: 'storage',
      title: 'Almacenamiento',
      icon: Database,
      items: [
        { id: 'manageStorage', label: 'Gestionar almacenamiento', description: '2.4 GB usados', type: 'button' },
        { id: 'autoDownload', label: 'Descarga automática', type: 'select' },
        { id: 'clearCache', label: 'Limpiar caché', type: 'button' },
      ],
    },
    {
      id: 'appearance',
      title: 'Apariencia',
      icon: Palette,
      items: [
        { id: 'theme', label: 'Tema', description: 'Oscuro', type: 'select', options: ['Oscuro', 'Claro', 'Sistema'] },
        { id: 'language', label: 'Idioma', description: 'Español', type: 'select', options: ['Español', 'English', 'Português'] },
      ],
    },
  ];

  const handleToggle = (sectionId: string, itemId: string) => {
    if (sectionId === 'notifications') {
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [itemId]: !prev.notifications[itemId as keyof typeof prev.notifications],
        },
      }));
    } else if (sectionId === 'privacy') {
      setSettings(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [itemId]: !prev.privacy[itemId as keyof typeof prev.privacy],
        },
      }));
    } else if (sectionId === 'security') {
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          [itemId]: !prev.security[itemId as keyof typeof prev.security],
        },
      }));
    }
  };

  const renderSectionContent = (section: SettingSection) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setActiveSection(null)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
        <section.icon className="w-6 h-6 text-secure-lilac" />
        <h2 className="text-xl font-bold text-white">{section.title}</h2>
      </div>
      
      <GlassCard className="divide-y divide-white/5">
        {section.items.map((item) => (
          <div 
            key={item.id}
            className={`flex items-center justify-between p-4 ${
              item.type === 'button' && 'cursor-pointer hover:bg-white/5 transition-colors'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <item.icon className={`w-5 h-5 ${
                  item.danger ? 'text-red-400' : 'text-gray-400'
                }`} />
              )}
              <div>
                <p className={`font-medium ${
                  item.danger ? 'text-red-400' : 'text-white'
                }`}>
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-500">{item.description}</p>
                )}
              </div>
            </div>
            
            {item.type === 'toggle' && (
              <Switch 
                checked={item.value}
                onCheckedChange={() => handleToggle(section.id, item.id)}
              />
            )}
            
            {item.type === 'select' && (
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-sm">{item.description}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
            
            {item.type === 'button' && !item.icon && (
              <ChevronRight className={`w-5 h-5 ${
                item.danger ? 'text-red-400' : 'text-gray-400'
              }`} />
            )}
          </div>
        ))}
      </GlassCard>
    </div>
  );

  if (activeSection) {
    const section = sections.find(s => s.id === activeSection);
    if (section) {
      return (
        <div className="p-4">
          {renderSectionContent(section)}
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-secure-purple/20">
        <h2 className="text-xl font-bold text-white">Configuración</h2>
      </div>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {/* Profile summary */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secure-lilac to-secure-lilac-dim flex items-center justify-center text-secure-black text-xl font-bold">
              AC
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Alexandra Chen</h3>
              <p className="text-sm text-gray-400">+1 555 123 4567</p>
              <p className="text-xs text-secure-lilac">Disponible para chat</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </GlassCard>

        {/* Sections */}
        <div className="space-y-2">
          {sections.map((section) => (
            <GlassCard
              key={section.id}
              hover
              className="p-4"
              onClick={() => setActiveSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secure-lilac/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-secure-lilac" />
                  </div>
                  <span className="font-medium text-white">{section.title}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </GlassCard>
          ))}
        </div>

        {/* App info */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">SecureChat v2.0.1</p>
          <p className="text-xs text-gray-600 mt-1">© 2024 SecureChat Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
