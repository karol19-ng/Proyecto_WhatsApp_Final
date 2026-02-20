import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Avatar } from '@/components/common/Avatar';
import { 
  Search, 
  MoreVertical, 
  CheckCircle,
  XCircle,
  Smartphone,
  Ban,
  UserCheck,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import type { User } from '@/types';

export const UsersManagementView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phoneNumber.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'verified' && user.isVerified) ||
                         (filterStatus === 'unverified' && !user.isVerified) ||
                         (filterStatus === 'blocked' && !user.isActive);
    return matchesSearch && matchesFilter;
  });

  const usersPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Bloqueado</span>;
    }
    if (user.isVerified && user.isDeviceLinked) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Verificado</span>;
    }
    if (user.isVerified && !user.isDeviceLinked) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Pendiente</span>;
    }
    return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">No verificado</span>;
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-gray-400">Administrar usuarios y verificaciones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-colors">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'unverified', 'blocked'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                filterStatus === status
                  ? 'bg-secure-lilac/20 text-secure-lilac border border-secure-lilac/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {status === 'all' && 'Todos'}
              {status === 'verified' && 'Verificados'}
              {status === 'unverified' && 'Pendientes'}
              {status === 'blocked' && 'Bloqueados'}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <GlassCard className="flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Usuario</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Teléfono</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Verificación</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Dispositivo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Registro</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} alt={user.name} size="sm" />
                      <span className="text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{user.countryCode} {user.phoneNumber}</td>
                  <td className="p-4">{getStatusBadge(user)}</td>
                  <td className="p-4">
                    {user.isVerified ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Sí</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">No</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {user.isDeviceLinked ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm">Vinculado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm">No vinculado</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {user.createdAt.toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => {}}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
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
            Mostrando {(currentPage - 1) * usersPerPage + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} de {filteredUsers.length}
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

      {/* User detail modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <GlassCard 
            variant="purple"
            className="w-full max-w-lg p-6"
            onClick={() => {}}
          >
            <div className="flex items-start gap-4 mb-6">
              <Avatar 
                src={selectedUser.avatar}
                alt={selectedUser.name}
                size="lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
                <p className="text-gray-400">{selectedUser.countryCode} {selectedUser.phoneNumber}</p>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(selectedUser)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400">Registro</p>
                <p className="text-white">{selectedUser.createdAt.toLocaleDateString('es-ES')}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400">Última vez</p>
                <p className="text-white">{selectedUser.lastSeen.toLocaleDateString('es-ES')}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400">Huella de clave</p>
                <p className="text-secure-lilac font-mono text-sm">{selectedUser.publicKeyFingerprint}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400">Estado</p>
                <p className="text-white capitalize">{selectedUser.status}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                Cerrar
              </button>
              {!selectedUser.isActive ? (
                <button className="flex-1 py-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Activar
                </button>
              ) : (
                <button className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                  <Ban className="w-4 h-4" />
                  Bloquear
                </button>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default UsersManagementView;
