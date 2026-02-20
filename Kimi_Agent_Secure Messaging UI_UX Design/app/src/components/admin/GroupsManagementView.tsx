import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Avatar } from '@/components/common/Avatar';
import { 
  Search, 
  Users, 
  Crown,
  Trash2,
  BarChart3,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { mockGroups, mockUsers } from '@/data/mockData';
import type { Group } from '@/types';

export const GroupsManagementView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredGroups = mockGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupsPerPage = 5;
  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * groupsPerPage,
    currentPage * groupsPerPage
  );

  const getUserById = (userId: string) => mockUsers.find(u => u.id === userId);

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Grupos</h1>
          <p className="text-gray-400">Administrar grupos y miembros</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar grupos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{mockGroups.length}</p>
              <p className="text-sm text-gray-400">Grupos totales</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {mockGroups.reduce((acc, g) => acc + g.members.length, 0)}
              </p>
              <p className="text-sm text-gray-400">Miembros totales</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secure-lilac/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-secure-lilac" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.2</p>
              <p className="text-sm text-gray-400">Miembros promedio</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Groups table */}
      <GlassCard className="flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Grupo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Miembros</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Administradores</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Creado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.map((group) => (
                <tr 
                  key={group.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedGroup(group)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src={group.avatar} 
                        alt={group.name}
                        size="sm"
                      />
                      <div>
                        <span className="text-white font-medium">{group.name}</span>
                        {group.description && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">{group.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>{group.members.length}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2">
                      {group.admins.slice(0, 3).map((adminId) => {
                        const admin = getUserById(adminId);
                        return (
                          <div key={adminId} className="relative">
                            <Avatar 
                              src={admin?.avatar}
                              alt={admin?.name || ''}
                              size="xs"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full border border-secure-black flex items-center justify-center">
                              <Crown className="w-2 h-2 text-secure-black" />
                            </div>
                          </div>
                        );
                      })}
                      {group.admins.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white border border-secure-black">
                          +{group.admins.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {group.createdAt.toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-4">
                    {group.isActive ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Activo</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Inactivo</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => {}}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Mostrando {(currentPage - 1) * groupsPerPage + 1} - {Math.min(currentPage * groupsPerPage, filteredGroups.length)} de {filteredGroups.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-sm text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Group detail modal */}
      {selectedGroup && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedGroup(null)}
        >
          <GlassCard 
            variant="purple"
            className="w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={() => {}}
          >
            <div className="flex items-start gap-4 mb-6">
              <Avatar 
                src={selectedGroup.avatar}
                alt={selectedGroup.name}
                size="xl"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{selectedGroup.name}</h3>
                <p className="text-gray-400">{selectedGroup.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedGroup.members.length} miembros
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Creado {selectedGroup.createdAt.toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>

            {/* Members list */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Miembros</h4>
              <div className="space-y-2">
                {selectedGroup.members.map((member) => {
                  const user = getUserById(member.userId);
                  const isAdmin = selectedGroup.admins.includes(member.userId);
                  
                  return (
                    <div 
                      key={member.userId}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar 
                          src={user?.avatar}
                          alt={user?.name || ''}
                          size="sm"
                        />
                        <div>
                          <p className="text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500">
                            Unido {member.joinedAt.toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedGroup(null)}
                className="flex-1 py-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                Cerrar
              </button>
              <button className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Eliminar grupo
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default GroupsManagementView;
