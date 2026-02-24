/**
 * PermissionSelector Component
 * Grouped permission checkboxes by category
 * Used in role creation wizard and edit tabs
 */

import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Checkbox, Collapse, Space, Typography, Spin, Alert } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { usePermissions } from '../../hooks/api';
import type { Permission } from '../../types';

const { Panel } = Collapse;
const { Text } = Typography;

const panelHeaderContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 16px',
  background: '#f6f9f4',
  borderRadius: 8,
  border: '1px solid #d9e3d1',
};

const permissionsContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16,
  padding: '16px 24px 24px',
};

const permissionItemStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid #f0f2ef',
  background: '#fff',
};

interface PermissionSelectorProps {
  value?: number[];
  onChange?: (permissionIds: number[]) => void;
  disabled?: boolean;
  primaryColor?: string;
}

export interface PermissionSelectorHandle {
  expandAll: () => void;
  collapseAll: () => void;
  expandFirst: () => void;
}

export const PermissionSelector = forwardRef<PermissionSelectorHandle, PermissionSelectorProps>(({
  value = [],
  onChange,
  disabled = false,
  primaryColor = '#324721',
}, ref) => {
  const { data: permissions, isLoading, error } = usePermissions();

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    if (!permissions) return {};
    
    return permissions.reduce((acc, permission) => {
      const category = permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const categories = useMemo(
    () => Object.keys(permissionsByCategory).sort(),
    [permissionsByCategory],
  );

  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    if (categories.length === 0) {
      setActiveKeys([]);
      return;
    }

    setActiveKeys(prev => {
      const filtered = prev.filter(key => categories.includes(key));
      if (filtered.length > 0 && filtered.length === prev.length && filtered.every((key, idx) => key === prev[idx])) {
        return prev;
      }

      if (filtered.length > 0) {
        return filtered;
      }

      return [categories[0]];
    });
  }, [categories]);

  const handleCollapseChange = (keys: string | string[]) => {
    const nextKeys = Array.isArray(keys) ? keys : [keys];
    setActiveKeys(nextKeys);
  };

  const expandAll = useCallback(() => {
    setActiveKeys(categories);
  }, [categories]);

  const collapseAll = useCallback(() => {
    setActiveKeys([]);
  }, []);

  const expandFirst = useCallback(() => {
    setActiveKeys(categories.length ? [categories[0]] : []);
  }, [categories]);

  useImperativeHandle(
    ref,
    () => ({
      expandAll,
      collapseAll,
      expandFirst,
    }),
    [expandAll, collapseAll, expandFirst],
  );

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (!onChange) return;

    const newValue = checked
      ? [...value, permissionId]
      : value.filter(id => id !== permissionId);
    
    onChange(newValue);
  };

  const handleCategorySelectAll = (category: string, checked: boolean) => {
    if (!onChange) return;

    const categoryPermissionIds = permissionsByCategory[category].map(p => p.id);
    
    const newValue = checked
      ? [...new Set([...value, ...categoryPermissionIds])]
      : value.filter(id => !categoryPermissionIds.includes(id));
    
    onChange(newValue);
  };

  const isCategoryFullySelected = (category: string): boolean => {
    const categoryPermissionIds = permissionsByCategory[category].map(p => p.id);
    return categoryPermissionIds.every(id => value.includes(id));
  };

  const isCategoryPartiallySelected = (category: string): boolean => {
    const categoryPermissionIds = permissionsByCategory[category].map(p => p.id);
    return categoryPermissionIds.some(id => value.includes(id)) && !isCategoryFullySelected(category);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading permissions...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Failed to load permissions"
        description="Please try again later."
        showIcon
      />
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <Alert
        type="warning"
        message="No permissions available"
        description="There are no permissions configured in the system."
        showIcon
      />
    );
  }

  return (
    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
      <Collapse
        activeKey={activeKeys}
        onChange={handleCollapseChange}
        ghost
        style={{ background: '#fff' }}
      >
        {categories.map(category => {
          const categoryPerms = permissionsByCategory[category];
          const isFullySelected = isCategoryFullySelected(category);
          const isPartiallySelected = isCategoryPartiallySelected(category);

          return (
            <Panel
              key={category}
              header={
                <div style={panelHeaderContainerStyle}>
                  <Checkbox
                    checked={isFullySelected}
                    indeterminate={isPartiallySelected}
                    onChange={(e: CheckboxChangeEvent) =>
                      handleCategorySelectAll(category, e.target.checked)
                    }
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      ...(isFullySelected && {
                        borderColor: primaryColor,
                      }),
                    }}
                  />
                  <Space size={6} align="center">
                    <Text strong style={{ textTransform: 'capitalize', fontSize: 14 }}>
                      {category.replace('_', ' ')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({categoryPerms.filter(p => value.includes(p.id)).length}/{categoryPerms.length})
                    </Text>
                  </Space>
                </div>
              }
              style={{
                borderBottom: '1px solid #c6c6c6',
                marginBottom: 12,
                background: 'transparent',
              }}
            >
              <div style={permissionsContainerStyle}>
                {categoryPerms.map(permission => (
                  <div key={permission.id} style={permissionItemStyle}>
                    <Checkbox
                      checked={value.includes(permission.id)}
                      onChange={(e: CheckboxChangeEvent) =>
                        handlePermissionChange(permission.id, e.target.checked)
                      }
                      disabled={disabled}
                      style={{
                        width: '100%',
                        ...(value.includes(permission.id) && {
                          borderColor: primaryColor,
                        }),
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Text >{permission.name}</Text>
                        {permission.description && (
                          <Text type="secondary" style={{ fontSize: 10 }}>
                            {permission.description}
                          </Text>
                        )}
                      </Space>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </Collapse>

      <div style={{ 
        marginTop: 16, 
        padding: '12px 16px', 
        background: '#f5f5f5', 
        borderRadius: 6 
      }}>
        <Text type="secondary">
          <strong>{value.length}</strong> permission{value.length !== 1 ? 's' : ''} selected
        </Text>
      </div>
    </div>
  );
});

PermissionSelector.displayName = 'PermissionSelector';

export default PermissionSelector;
