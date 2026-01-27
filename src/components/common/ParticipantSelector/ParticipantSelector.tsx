/**
 * ParticipantSelector Component
 * Reusable component for selecting meeting participants
 * Uses accordion groups by role with add modal
 * Board and theme context aware
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Input,
  Avatar,
  Button,
  Space,
  Typography,
  Collapse,
  Modal,
  Empty,
  Spin,
  Badge,
  Tooltip,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  DeleteOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CrownOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  UserSwitchOutlined,
  EyeOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { getBoardMembers } from '../../../mocks/db/queries/boardQueries';
import { boardSettingsTable } from '../../../mocks/db/tables/boardSettings';

const { Text } = Typography;
const { Panel } = Collapse;

// ============================================================================
// TYPES
// ============================================================================

// Board member from query
interface BoardMemberData {
  id: number;
  odooUserId: number;
  odooUserName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  roleName: string;
  roleId: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  isPrimary: boolean;
  hasCertificate: boolean;
  certificateExpiry: string | null;
}

export interface SelectedParticipant {
  id: string;
  odataId?: string;
  odataType?: string;
  userId: string | number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  roleName: string;
  isRequired?: boolean;
  isGuest?: boolean;
  guestRole?: string;
  canViewDocuments?: boolean;
  canShareScreen?: boolean;
  receiveMinutes?: boolean;
}

export interface ParticipantSelectorProps {
  boardId?: string;
  value?: SelectedParticipant[];
  onChange?: (participants: SelectedParticipant[]) => void;
  defaultSelected?: 'all' | 'board_members' | 'none';
  showQuorumSettings?: boolean;
  quorumPercentage?: number;
  onQuorumChange?: (percentage: number) => void;
  allowGuests?: boolean;
  allowRemoveRequired?: boolean;
  maxHeight?: number | string;
  minParticipants?: number;
  maxParticipants?: number;
}

// Role group configuration
interface RoleGroup {
  key: string;
  title: string;
  icon: React.ReactNode;
  roles: string[];
  color: string;
  isRequired?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_GROUPS: RoleGroup[] = [
  {
    key: 'leadership',
    title: 'Leadership',
    icon: <CrownOutlined />,
    roles: ['chairman', 'vice_chairman'],
    color: '#faad14',
    isRequired: true,
  },
  {
    key: 'secretariat',
    title: 'Secretariat',
    icon: <SafetyCertificateOutlined />,
    roles: ['group_company_secretary', 'company_secretary', 'board_secretary'],
    color: '#1890ff',
    isRequired: false,
  },
  {
    key: 'board_members',
    title: 'Board Members',
    icon: <TeamOutlined />,
    roles: ['board_member', 'independent_director'],
    color: '#52c41a',
  },
  {
    key: 'executive',
    title: 'Executive Members',
    icon: <UserSwitchOutlined />,
    roles: ['executive_member'],
    color: '#722ed1',
  },
  {
    key: 'committee',
    title: 'Committee Members',
    icon: <SolutionOutlined />,
    roles: ['committee_member', 'committee_chairman', 'committee_secretary'],
    color: '#13c2c2',
  },
  {
    key: 'observers',
    title: 'Observers',
    icon: <EyeOutlined />,
    roles: ['observer'],
    color: '#8c8c8c',
  },
  {
    key: 'guests',
    title: 'Guests & Presenters',
    icon: <UserOutlined />,
    roles: ['guest', 'presenter'],
    color: '#eb2f96',
  },
];

// All roles are now removable - no required roles
// Chairman, vice_chairman, etc. can be absent from meetings
const REQUIRED_ROLES: string[] = [];

// ============================================================================
// COMPONENT
// ============================================================================

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  boardId: propBoardId,
  value = [],
  onChange,
  defaultSelected = 'board_members',
  showQuorumSettings = true,
  quorumPercentage = 50,
  onQuorumChange,
  allowGuests = true,
  allowRemoveRequired = false,
  maxHeight: _maxHeight = 400, // Reserved for future scrollable container
  minParticipants,
  maxParticipants,
}) => {
  const { currentBoard, theme } = useBoardContext();
  const boardId = propBoardId || currentBoard?.id || '';
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [allMembers, setAllMembers] = useState<BoardMemberData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [localQuorum, setLocalQuorum] = useState(quorumPercentage);
  const [activeKey, setActiveKey] = useState<string | undefined>('leadership'); // Single accordion open
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRoleGroup, setModalRoleGroup] = useState<RoleGroup | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  
  // Load board members from mock data
  useEffect(() => {
    if (boardId) {
      setIsLoading(true);
      // Use the query function directly from mock db
      const members = getBoardMembers(boardId) as BoardMemberData[];
      setAllMembers(members);
      setIsLoading(false);
    }
  }, [boardId]);
  
  // Get default quorum from board settings
  useEffect(() => {
    if (boardId) {
      const settings = boardSettingsTable.find(s => s.boardId === boardId);
      if (settings?.quorumPercentage) {
        setLocalQuorum(settings.quorumPercentage);
      }
    }
  }, [boardId]);
  
  // Map member to participant - defined before useEffect that uses it
  const mapMemberToParticipant = useCallback((member: BoardMemberData): SelectedParticipant => ({
    id: `participant-${member.odooUserId}`,
    userId: member.odooUserId,
    name: member.odooUserName,
    email: member.email,
    avatar: member.avatar || undefined,
    role: member.role,
    roleName: member.roleName,
    isRequired: REQUIRED_ROLES.includes(member.role),
    isGuest: ['guest', 'presenter'].includes(member.role),
    canViewDocuments: true,
    canShareScreen: true,
    receiveMinutes: true,
  }), []);
  
  // Initialize selected participants - only runs ONCE when component first loads with empty value
  useEffect(() => {
    if (!isInitialized && allMembers.length > 0 && value.length === 0) {
      let initialSelected: SelectedParticipant[] = [];
      
      if (defaultSelected === 'all') {
        initialSelected = allMembers.map(mapMemberToParticipant);
      } else if (defaultSelected === 'board_members') {
        // Auto-select only actual board meeting participants
        // These are the role codes from rolesTable that should be auto-selected
        // Note: board_secretary and company_secretary are NOT auto-selected
        // They can be added manually from the secretariat group
        const autoSelectRoles = [
          'chairman',           // Board chairman
          'vice_chairman',      // Vice chairman
          'board_member',       // Regular board member
          'executive_member',   // Executives (CEO, CFO, etc.)
          'committee_member',   // Committee members
          'group_chairman',     // Group chairman (if on this board)
          'group_company_secretary', // Group secretary - only secretariat role auto-selected
        ];
        
        // Exclude these roles from auto-selection (can still be added manually)
        // - system_admin: IT/system roles, not meeting participants
        // - observer: view-only, not voting members
        // - presenter: external presenters, added per-meeting
        // - guest: temporary access, added per-meeting
        
        initialSelected = allMembers
          .filter(m => autoSelectRoles.includes(m.role))
          .map(mapMemberToParticipant);
      }
      // defaultSelected === 'none' - start with empty selection
      
      if (initialSelected.length > 0) {
        onChange?.(initialSelected);
      }
      setIsInitialized(true);
    }
  }, [allMembers, defaultSelected, isInitialized, onChange, value.length, mapMemberToParticipant]);
  
  // Check if member is selected
  const isSelected = useCallback((member: BoardMemberData) => {
    return value.some(p => p.userId === member.odooUserId);
  }, [value]);
  
  // Get members by role group
  const getMembersByGroup = useCallback((group: RoleGroup) => {
    return allMembers.filter(m => group.roles.includes(m.role));
  }, [allMembers]);
  
  // Get selected members by role group
  const getSelectedByGroup = useCallback((group: RoleGroup) => {
    return value.filter(p => group.roles.includes(p.role));
  }, [value]);
  
  // Add participant
  const addParticipant = useCallback((member: BoardMemberData) => {
    if (maxParticipants && value.length >= maxParticipants) return;
    if (isSelected(member)) return;
    
    const participant = mapMemberToParticipant(member);
    onChange?.([...value, participant]);
  }, [value, onChange, maxParticipants, isSelected, mapMemberToParticipant]);
  
  // Remove participant
  const removeParticipant = useCallback((participant: SelectedParticipant) => {
    if (participant.isRequired && !allowRemoveRequired) return;
    onChange?.(value.filter(p => p.userId !== participant.userId));
  }, [value, onChange, allowRemoveRequired]);
  
  // Open add modal for a role group
  const openAddModal = (group: RoleGroup) => {
    setModalRoleGroup(group);
    setModalSearch('');
    setModalVisible(true);
  };
  
  // Get available members for modal (filtered by role group and search)
  const getAvailableForModal = useMemo(() => {
    if (!modalRoleGroup) return [];
    
    let members = getMembersByGroup(modalRoleGroup);
    
    if (modalSearch) {
      const search = modalSearch.toLowerCase();
      members = members.filter(m =>
        m.odooUserName.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search)
      );
    }
    
    return members;
  }, [modalRoleGroup, modalSearch, getMembersByGroup]);
  
  // Calculate quorum
  const quorumInfo = useMemo(() => {
    const totalSelected = value.filter(p => !p.isGuest).length;
    const required = Math.ceil((totalSelected * localQuorum) / 100);
    const canMeetQuorum = totalSelected >= required;
    
    return { total: totalSelected, required, percentage: localQuorum, canMeetQuorum };
  }, [value, localQuorum]);
  
  // Handle quorum change
  const handleQuorumChange = (newValue: number | null) => {
    const val = newValue || 50;
    setLocalQuorum(val);
    onQuorumChange?.(val);
  };
  
  // Render participant row in accordion
  const renderParticipantRow = (participant: SelectedParticipant) => {
    const canRemove = !participant.isRequired || allowRemoveRequired;
    
    return (
      <div
        key={participant.userId}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: 6,
          backgroundColor: theme.backgroundSecondary,
          marginBottom: 6,
          border: `1px solid ${theme.borderColor}`,
        }}
      >
        <Avatar
          src={participant.avatar}
          icon={<UserOutlined />}
          size={32}
          style={{ marginRight: 10, flexShrink: 0 }}
        />
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text strong style={{ fontSize: 13 }} ellipsis>
              {participant.name}
            </Text>
            {participant.isRequired && (
              <Tooltip title="Required participant">
                <CrownOutlined style={{ color: theme.warningColor, fontSize: 11 }} />
              </Tooltip>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: 11 }} ellipsis>
            {participant.email}
          </Text>
        </div>
        
        <Text type="secondary" style={{ fontSize: 11, marginRight: 8 }}>
          {participant.roleName}
        </Text>
        
        {canRemove && (
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeParticipant(participant)}
          >
            Remove
          </Button>
        )}
      </div>
    );
  };
  
  // Render member row in modal
  const renderModalMemberRow = (member: BoardMemberData) => {
    const selected = isSelected(member);
    
    return (
      <div
        key={member.odooUserId}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: 8,
          backgroundColor: selected ? `${theme.primaryColor}08` : theme.backgroundSecondary,
          marginBottom: 8,
          border: `1px solid ${selected ? theme.primaryColor : theme.borderColor}`,
          cursor: selected ? 'default' : 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => !selected && addParticipant(member)}
      >
        <Avatar
          src={member.avatar}
          icon={<UserOutlined />}
          size={40}
          style={{ marginRight: 12, flexShrink: 0 }}
        />
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: 14 }}>
            {member.odooUserName}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {member.email}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {member.roleName}
          </Text>
        </div>
        
        {selected ? (
          <Badge
            count={<CheckOutlined style={{ color: theme.successColor }} />}
            style={{ backgroundColor: `${theme.successColor}20` }}
          />
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              addParticipant(member);
            }}
          >
            Add
          </Button>
        )}
      </div>
    );
  };
  
  // Render accordion panel header
  const renderPanelHeader = (group: RoleGroup) => {
    const selectedCount = getSelectedByGroup(group).length;
    const totalCount = getMembersByGroup(group).length;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <span style={{ color: group.color, marginRight: 8 }}>{group.icon}</span>
        <Text strong style={{ flex: 1 }}>{group.title}</Text>
        <Badge
          count={selectedCount}
          style={{ backgroundColor: selectedCount > 0 ? group.color : '#d9d9d9' }}
        />
        <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
          of {totalCount}
        </Text>
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            openAddModal(group);
          }}
          style={{ marginLeft: 8 }}
        >
          Add
        </Button>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading board members...</Text>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Summary Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          padding: '12px 16px',
          borderRadius: 8,
          backgroundColor: theme.backgroundTertiary,
        }}
      >
        <div>
          <Text strong style={{ fontSize: 14 }}>Selected Participants</Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            {value.length} of {allMembers.length}
          </Text>
        </div>
        {showQuorumSettings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Quorum:</Text>
            <InputNumber
              value={localQuorum}
              onChange={handleQuorumChange}
              min={1}
              max={100}
              size="small"
              formatter={(val) => `${val}%`}
              parser={(val) => parseInt(val?.replace('%', '') || '50', 10)}
              style={{ width: 70 }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 4,
                backgroundColor: quorumInfo.canMeetQuorum
                  ? `${theme.successColor}15`
                  : `${theme.warningColor}15`,
              }}
            >
              {quorumInfo.canMeetQuorum ? (
                <CheckCircleOutlined style={{ color: theme.successColor, fontSize: 12 }} />
              ) : (
                <WarningOutlined style={{ color: theme.warningColor, fontSize: 12 }} />
              )}
              <Text style={{ fontSize: 11, color: quorumInfo.canMeetQuorum ? theme.successColor : theme.warningColor }}>
                {quorumInfo.required} required
              </Text>
            </div>
          </div>
        )}
      </div>
      
      {/* Role Group Accordions - Single select with active styling */}
      <Collapse
        accordion
        activeKey={activeKey}
        onChange={(key) => setActiveKey(Array.isArray(key) ? key[0] : key)}
        style={{ backgroundColor: 'transparent', border: 'none' }}
      >
        {ROLE_GROUPS.map(group => {
          const selectedInGroup = getSelectedByGroup(group);
          const membersInGroup = getMembersByGroup(group);
          const isActive = activeKey === group.key;
          
          // Skip empty groups (except guests if allowGuests)
          if (membersInGroup.length === 0 && group.key !== 'guests') return null;
          if (group.key === 'guests' && !allowGuests) return null;
          
          return (
            <Panel
              key={group.key}
              header={renderPanelHeader(group)}
              style={{
                marginBottom: 8,
                borderRadius: 8,
                border: isActive ? `2px solid ${theme.primaryColor}` : `1px solid ${theme.borderColor}`,
                backgroundColor: isActive ? `${theme.primaryColor}08` : 'transparent',
                overflow: 'hidden',
              }}
            >
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {selectedInGroup.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No participants selected"
                    style={{ margin: '16px 0' }}
                  />
                ) : (
                  selectedInGroup.map(renderParticipantRow)
                )}
              </div>
            </Panel>
          );
        })}
      </Collapse>
      
      {/* Validation Messages */}
      {minParticipants && value.length < minParticipants && (
        <div style={{ marginTop: 12 }}>
          <Text type="danger" style={{ fontSize: 12 }}>
            Minimum {minParticipants} participants required. Currently selected: {value.length}
          </Text>
        </div>
      )}
      
      {/* Add Participant Modal */}
      <Modal
        title={
          <Space>
            {modalRoleGroup?.icon}
            <span>Add {modalRoleGroup?.title}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="done" type="primary" onClick={() => setModalVisible(false)}>
            Done
          </Button>,
        ]}
        width={500}
      >
        <Input
          placeholder="Search by name or email..."
          prefix={<SearchOutlined style={{ color: theme.textSecondary }} />}
          value={modalSearch}
          onChange={(e) => setModalSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {getAvailableForModal.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={modalSearch ? 'No matching members' : 'No members available'}
            />
          ) : (
            getAvailableForModal.map(renderModalMemberRow)
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ParticipantSelector;
