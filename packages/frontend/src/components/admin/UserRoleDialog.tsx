'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserRole } from '../../lib/api';
import { toast } from 'sonner';

const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'travel_agent', label: 'Travel Agent' },
  { value: 'finance_staff', label: 'Finance Staff' },
  { value: 'operations_staff', label: 'Operations Staff' },
  { value: 'support_staff', label: 'Support Staff' },
  { value: 'customer', label: 'Customer' },
] as const;

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    roles: UserRole[];
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  } | null;
  onRoleUpdate: (userId: string, role: UserRole) => Promise<boolean>;
}

export function UserRoleDialog({ open, onOpenChange, user, onRoleUpdate }: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      // Set the highest role if user has multiple roles
      const roleValues = USER_ROLES.map(r => r.value);
      const highestRole = user.roles.reduce((highest, role) => {
        const currentLevel = roleValues.indexOf(role);
        const highestLevel = roleValues.indexOf(highest);
        return currentLevel > highestLevel ? role : highest;
      }, user.roles[0] || 'customer');
      
      setSelectedRole(highestRole);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      const success = await onRoleUpdate(user.id, selectedRole);
      
      if (success) {
        toast.success('User role updated successfully');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Updating role for: <span className="font-medium">{user.email}</span>
            </p>
            <p className="text-sm">
              Current status:{' '}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.status}
              </span>
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
