'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search, User, UserCog, UserX, UserCheck, RefreshCw } from 'lucide-react';
import { UserRole, USER_ROLES } from '@/app/models/user.model';
import { UserRoleDialog } from '@/components/admin/UserRoleDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  status: UserStatus;
  emailVerified: boolean;
  phoneNumber?: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/users', {
        params: {
          ...(filter !== 'all' && { status: filter }),
          ...(searchTerm && { search: searchTerm }),
        },
      });
      
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    if (!role) return false;
    
    try {
      await api.patch(`/users/${userId}/role`, { role });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, roles: [role] } : user
      ));
      toast.success('User role updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error?.message || 'Failed to update user role');
      return false;
    }
  };

  const handleUpdateStatus = async (userId: string, status: UserStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [userId]: true }));
      await api.patch(`/users/${userId}/status`, { status });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
      
      toast.success(`User ${status.toLowerCase()} successfully`);
      return true;
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(error?.message || `Failed to ${status.toLowerCase()} user`);
      return false;
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getHighestRole = (roles: UserRole[]): UserRole => {
    if (!roles.length) return 'CUSTOMER';
    return roles.reduce((highest, role) => {
      const currentLevel = Object.values(USER_ROLES).indexOf(role);
      const highestLevel = Object.values(USER_ROLES).indexOf(highest as UserRole);
      return currentLevel > highestLevel ? role : highest;
    }, roles[0]);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'default';
      case 'TRAVEL_AGENT':
        return 'secondary';
      case 'FINANCE_STAFF':
      case 'OPERATIONS_STAFF':
      case 'SUPPORT_STAFF':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusVariant = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'outline';
      case 'SUSPENDED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || user.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all platform users and their permissions</p>
          </div>
          <Button
            onClick={fetchUsers}
            variant="outline"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Select 
                value={filter} 
                onValueChange={(value) => setFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={fetchUsers}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'There are no users in the system yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const highestRole = getHighestRole(user.roles);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(highestRole)}>
                            {highestRole.split('_').map(word => 
                              word.charAt(0) + word.slice(1).toLowerCase()
                            ).join(' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(user.status)}>
                            {user.status.charAt(0) + user.status.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? format(new Date(user.lastLogin), 'PPpp') : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsRoleDialogOpen(true);
                              }}
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Edit Role
                            </Button>
                            
                            {user.status === 'SUSPENDED' || user.status === 'INACTIVE' || user.status === 'PENDING' ? (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleUpdateStatus(user.id, 'ACTIVE')}
                                disabled={updatingStatus[user.id]}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                {updatingStatus[user.id] ? 'Activating...' : 'Activate'}
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUpdateStatus(user.id, 'SUSPENDED')}
                                disabled={updatingStatus[user.id]}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                {updatingStatus[user.id] ? 'Suspending...' : 'Suspend'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      
      <UserRoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        user={selectedUser}
        onRoleUpdate={handleUpdateRole}
      />
    </AdminLayout>
  );
}
