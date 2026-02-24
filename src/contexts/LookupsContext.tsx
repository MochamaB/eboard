/**
 * Lookups Context
 * Provides global access to all lookup tables throughout the app
 * Fetches all lookups on mount and caches them via React Query
 */

import React, { createContext, useContext, useMemo } from 'react';
import {
  useBoardTypes,
  useBoardZones,
  useMeetingTypes,
  useMeetingFrequencies,
  useVotingThresholds,
  useDocumentCategories,
  useAgendaItemTypes,
  useResolutionCategories,
  useRoles,
  usePermissions,
} from '../hooks/api/useLookups';
import type {
  BoardTypeLookup,
  BoardZoneLookup,
  MeetingTypeLookup,
  MeetingFrequencyLookup,
  VotingThresholdLookup,
  DocumentCategoryLookup,
  AgendaItemTypeLookup,
  ResolutionCategoryLookup,
  RoleLookup,
  PermissionGroup,
  PermissionLookup,
  LookupOption,
} from '../types/lookup.types';

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface LookupsContextValue {
  boardTypes: BoardTypeLookup[];
  boardZones: BoardZoneLookup[];
  meetingTypes: MeetingTypeLookup[];
  meetingFrequencies: MeetingFrequencyLookup[];
  votingThresholds: VotingThresholdLookup[];
  documentCategories: DocumentCategoryLookup[];
  agendaItemTypes: AgendaItemTypeLookup[];
  resolutionCategories: ResolutionCategoryLookup[];
  roles: RoleLookup[];
  permissionGroups: PermissionGroup[];
  permissions: PermissionLookup[]; // Flattened list of all permissions
  
  isLoading: boolean;
  isError: boolean;
  
  getBoardTypeByCode: (code: string) => BoardTypeLookup | undefined;
  getBoardZoneByCode: (code: string) => BoardZoneLookup | undefined;
  getMeetingTypeByCode: (code: string) => MeetingTypeLookup | undefined;
  getMeetingFrequencyByCode: (code: string) => MeetingFrequencyLookup | undefined;
  getVotingThresholdByCode: (code: string) => VotingThresholdLookup | undefined;
  getDocumentCategoryByCode: (code: string) => DocumentCategoryLookup | undefined;
  getAgendaItemTypeByCode: (code: string) => AgendaItemTypeLookup | undefined;
  getResolutionCategoryByCode: (code: string) => ResolutionCategoryLookup | undefined;
  getRoleByCode: (code: string) => RoleLookup | undefined;
  getPermissionByCode: (code: string) => PermissionLookup | undefined;
  
  boardTypeOptions: LookupOption[];
  boardZoneOptions: LookupOption[];
  meetingTypeOptions: LookupOption[];
  meetingFrequencyOptions: LookupOption[];
  votingThresholdOptions: LookupOption[];
  documentCategoryOptions: LookupOption[];
  agendaItemTypeOptions: LookupOption[];
  resolutionCategoryOptions: LookupOption[];
  roleOptions: LookupOption[];
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const LookupsContext = createContext<LookupsContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface LookupsProviderProps {
  children: React.ReactNode;
}

export const LookupsProvider: React.FC<LookupsProviderProps> = ({ children }) => {
  // Fetch all lookups
  const { data: boardTypes = [], isLoading: loadingBoardTypes, isError: errorBoardTypes } = useBoardTypes();
  const { data: boardZones = [], isLoading: loadingBoardZones, isError: errorBoardZones } = useBoardZones();
  const { data: meetingTypes = [], isLoading: loadingMeetingTypes, isError: errorMeetingTypes } = useMeetingTypes();
  const { data: meetingFrequencies = [], isLoading: loadingMeetingFrequencies, isError: errorMeetingFrequencies } = useMeetingFrequencies();
  const { data: votingThresholds = [], isLoading: loadingVotingThresholds, isError: errorVotingThresholds } = useVotingThresholds();
  const { data: documentCategories = [], isLoading: loadingDocumentCategories, isError: errorDocumentCategories } = useDocumentCategories();
  const { data: agendaItemTypes = [], isLoading: loadingAgendaItemTypes, isError: errorAgendaItemTypes } = useAgendaItemTypes();
  const { data: resolutionCategories = [], isLoading: loadingResolutionCategories, isError: errorResolutionCategories } = useResolutionCategories();
  const { data: roles = [], isLoading: loadingRoles, isError: errorRoles } = useRoles();
  const { data: permissionGroups = [], isLoading: loadingPermissions, isError: errorPermissions } = usePermissions();
  
  // Flatten permissions from groups
  const permissions = useMemo(() => {
    return permissionGroups.flatMap(group => group.permissions);
  }, [permissionGroups]);
  
  // Combined loading and error states
  const isLoading = loadingBoardTypes || loadingBoardZones || loadingMeetingTypes || 
    loadingMeetingFrequencies || loadingVotingThresholds || loadingDocumentCategories || 
    loadingAgendaItemTypes || loadingResolutionCategories || loadingRoles || loadingPermissions;
  
  const isError = errorBoardTypes || errorBoardZones || errorMeetingTypes || 
    errorMeetingFrequencies || errorVotingThresholds || errorDocumentCategories || 
    errorAgendaItemTypes || errorResolutionCategories || errorRoles || errorPermissions;

  const getBoardTypeByCode = useMemo(
    () => (code: string) => boardTypes.find((item) => item.code === code),
    [boardTypes]
  );

  const getBoardZoneByCode = useMemo(
    () => (code: string) => boardZones.find((item) => item.code === code),
    [boardZones]
  );

  const getMeetingTypeByCode = useMemo(
    () => (code: string) => meetingTypes.find((item) => item.code === code),
    [meetingTypes]
  );

  const getMeetingFrequencyByCode = useMemo(
    () => (code: string) => meetingFrequencies.find((item) => item.code === code),
    [meetingFrequencies]
  );

  const getVotingThresholdByCode = useMemo(
    () => (code: string) => votingThresholds.find((item) => item.code === code),
    [votingThresholds]
  );

  const getDocumentCategoryByCode = useMemo(
    () => (code: string) => documentCategories.find((item) => item.code === code),
    [documentCategories]
  );

  const getAgendaItemTypeByCode = useMemo(
    () => (code: string) => agendaItemTypes.find((item) => item.code === code),
    [agendaItemTypes]
  );
  
  const getResolutionCategoryByCode = useMemo(() => 
    (code: string) => resolutionCategories.find(item => item.code === code),
    [resolutionCategories]
  );
  
  const getRoleByCode = useMemo(() => 
    (code: string) => roles.find(item => item.code === code),
    [roles]
  );
  
  const getPermissionByCode = useMemo(() => 
    (code: string) => permissions.find(item => item.code === code),
    [permissions]
  );
  
  // Memoized options arrays for dropdowns
  const boardTypeOptions = useMemo(() => 
    boardTypes.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [boardTypes]
  );
  
  const boardZoneOptions = useMemo(() => 
    boardZones.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [boardZones]
  );
  
  const meetingTypeOptions = useMemo(() => 
    meetingTypes.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [meetingTypes]
  );
  
  const meetingFrequencyOptions = useMemo(() => 
    meetingFrequencies.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [meetingFrequencies]
  );
  
  const votingThresholdOptions = useMemo(() => 
    votingThresholds.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [votingThresholds]
  );
  
  const documentCategoryOptions = useMemo(() => 
    documentCategories.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [documentCategories]
  );
  
  const agendaItemTypeOptions = useMemo(() => 
    agendaItemTypes.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [agendaItemTypes]
  );
  
  const resolutionCategoryOptions = useMemo(() => 
    resolutionCategories.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [resolutionCategories]
  );
  
  const roleOptions = useMemo(() => 
    roles.map(item => ({ value: item.code, label: item.name, id: item.id })),
    [roles]
  );

  const value: LookupsContextValue = {
    boardTypes,
    boardZones,
    meetingTypes,
    meetingFrequencies,
    votingThresholds,
    documentCategories,
    agendaItemTypes,
    resolutionCategories,
    roles,
    permissionGroups,
    permissions,
    
    isLoading,
    isError,
    
    getBoardTypeByCode,
    getBoardZoneByCode,
    getMeetingTypeByCode,
    getMeetingFrequencyByCode,
    getVotingThresholdByCode,
    getDocumentCategoryByCode,
    getAgendaItemTypeByCode,
    getResolutionCategoryByCode,
    getRoleByCode,
    getPermissionByCode,
    
    boardTypeOptions,
    boardZoneOptions,
    meetingTypeOptions,
    meetingFrequencyOptions,
    votingThresholdOptions,
    documentCategoryOptions,
    agendaItemTypeOptions,
    resolutionCategoryOptions,
    roleOptions,
  };

  return (
    <LookupsContext.Provider value={value}>
      {children}
    </LookupsContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useLookups = (): LookupsContextValue => {
  const context = useContext(LookupsContext);
  if (context === undefined) {
    throw new Error('useLookups must be used within a LookupsProvider');
  }
  return context;
};
