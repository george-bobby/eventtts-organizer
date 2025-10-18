import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/utils/auth';
import { UserRoleType } from '@/lib/models/userrole.model';

interface RoleBadgeProps {
  role: UserRoleType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const badgeColor = variant === 'default' ? getRoleBadgeColor(role) : '';

  return (
    <Badge 
      className={`
        ${variant === 'default' ? badgeColor : ''} 
        ${sizeClasses[size]} 
        font-medium 
        ${className}
      `}
      variant={variant}
    >
      {getRoleDisplayName(role)}
    </Badge>
  );
};

export default RoleBadge;
