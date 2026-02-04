/**
 * Common Components Index
 * Re-export all reusable components
 */

// DataTable
export { DataTable, type DataTableProps, type BulkAction, type ExportOption } from './DataTable';

// FilterBar
export { FilterBar, type FilterBarProps, type FilterConfig, type FilterOption, type FilterType, type QuickFilter } from './FilterBar';

// SearchBox
export { SearchBox, type SearchBoxProps } from './SearchBox';

// WizardForm
export { WizardForm, type WizardFormProps, type WizardStep } from './WizardForm';

// HorizontalTabs
export { HorizontalTabs, type HorizontalTabsProps, type HorizontalTabItem } from './HorizontalTabs';

// DetailsHeader
export { DetailsHeader, type DetailsHeaderProps, type MetadataItem, type ActionButton } from './DetailsHeader';

// CardView
export { CardView, type CardViewProps } from './CardView';

// CalendarView
export { CalendarView, type CalendarViewProps, type CalendarEvent } from './CalendarView';

// IndexPageLayout
export { IndexPageLayout, type IndexPageLayoutProps, type TabItem } from './IndexPageLayout';

// DetailPageLayout
export { DetailPageLayout, type DetailPageLayoutProps } from './DetailPageLayout';

// MeetingPhaseIndicator
export { MeetingPhaseIndicator } from './MeetingPhaseIndicator';

// ParticipantSelector
export { ParticipantSelector, type ParticipantSelectorProps, type SelectedParticipant } from './ParticipantSelector';

// Agenda Components
export { AgendaStatusBadge, ItemTypeTag, TimeDisplay, ItemNumberBadge, AgendaItemCard, AgendaHeader, AgendaEmptyState, InlineEditableField } from './Agenda';
export type { InlineEditableFieldProps, SelectOption, FieldType } from './Agenda/InlineEditableField';

// Accordion
export { Accordion, type AccordionProps, type AccordionItem } from './Accordion';

// SignatureCanvas
export { SignatureCanvas } from './SignatureCanvas';

// DocumentUpload
export { DocumentUpload, type DocumentUploadProps } from './DocumentUpload';
