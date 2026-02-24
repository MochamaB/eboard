# Lookup Gap Analysis: Backend vs Frontend

## Executive Summary

This document compares backend lookup tables with frontend hardcoded enum types to identify gaps and plan the migration to dynamic lookup-based architecture.

---

## Backend Lookup Tables (Database-Driven)

### Available via `/api/lookups/*` endpoints:

1. **Board Types** (`/api/lookups/board-types`)
   - Fields: `id`, `code`, `name`, `description`, `icon`
   - Values: `main`, `subsidiary`, `factory`, `committee`

2. **Board Zones** (`/api/lookups/board-zones`)
   - Fields: `id`, `code`, `name`, `description`
   - Values: `zone_1` through `zone_12` (12 zones)

3. **Meeting Types** (`/api/lookups/meeting-types`)
   - Fields: `id`, `code`, `name`, `description`, `defaultDuration`, `requiresNotice`, `noticeMinimumDays`
   - Values: `regular`, `special`, `agm`, `emergency`, `committee`

4. **Meeting Frequencies** (`/api/lookups/meeting-frequencies`)
   - Fields: `id`, `code`, `name`, `description`
   - Values: `monthly`, `bi_monthly`, `quarterly`, `semi_annual`, `annual`, `as_needed`

5. **Voting Thresholds** (`/api/lookups/voting-thresholds`)
   - Fields: `id`, `code`, `name`, `description`, `percentage`
   - Values: `simple_majority` (51%), `two_thirds` (67%), `three_quarters` (75%), `unanimous` (100%)

6. **Document Categories** (`/api/lookups/document-categories`)
   - Fields: `id`, `code`, `name`, `description`, `icon`, `color`, `isSystem`
   - Values: `agenda`, `minutes`, `board_pack`, `presentation`, `report`, `policy`, `contract`, `correspondence`, `attachment`, `notice`, `resolution`, `certificate`, `financial`, `audit`, `compliance`, `other` (16 categories)

7. **Agenda Item Types** (`/api/lookups/agenda-item-types`)
   - Fields: `id`, `code`, `name`, `description`
   - Values: `regular`, `approval`, `discussion`, `information`, `presentation`, `election`, `procedural`

8. **Resolution Categories** (`/api/lookups/resolution-categories`)
   - Fields: `id`, `code`, `name`, `description`
   - Values: `governance`, `financial`, `operational`, `strategic`, `compliance`, `hr`, `other`

---

## Backend Enums (Code-Driven, Serialized as Strings)

### System state enums (not in lookup tables):

1. **BoardStatus** - `active`, `inactive`
2. **UserStatus** - `active`, `inactive`, `pending`, `suspended`
3. **MeetingStatus** - `draft`, `scheduled`, `inProgress`, `completed`, `cancelled`
4. **DraftSubStatus** - `incomplete`, `complete`
5. **ScheduledSubStatus** - `pendingApproval`, `approved`, `rejected`
6. **CompletedSubStatus** - `recent`, `archived`
7. **LocationType** - `virtual`, `physical`, `hybrid`
8. **RSVPStatus** - `pending`, `accepted`, `declined`, `tentative`, `noResponse`
9. **VoteStatus** - `draft`, `configured`, `open`, `closed`, `archived`
10. **VoteOutcome** - `passed`, `failed`, `invalid`
11. **MinutesStatus** - `draft`, `pendingReview`, `revisionRequested`, `approved`, `published`
12. **DocumentStatus** - `uploading`, `processing`, `draft`, `published`, `archived`, `deleted`
13. **AgendaStatus** - `draft`, `published`
14. **ActionItemStatus** - `pending`, `inProgress`, `completed`, `cancelled`
15. **ActionItemPriority** - `low`, `medium`, `high`, `critical`
16. **AttendanceStatus** - `present`, `absent`, `excused`, `late`
17. **ResolutionDecision** - `approved`, `rejected`, `tabled`, `deferred`

---

## Frontend Hardcoded Types (Should Use Lookups)

### ✅ CORRECT - Using Lookups (Should Fetch from API):

| Frontend Type | Backend Lookup | Status |
|---------------|----------------|--------|
| `BoardTypeSchema` | `board-types` | ✅ Match (4 values) |
| `MeetingFrequencySchema` | `meeting-frequencies` | ⚠️ **Missing `semi_annual`** |
| `VotingThresholdSchema` | `voting-thresholds` | ✅ Match (4 values) |
| `MeetingTypeSchema` | `meeting-types` | ✅ Match (5 values) |
| `ZoneSchema` | `board-zones` | ❌ **Frontend has 7, Backend has 12** |

### ✅ CORRECT - Using Enums (System States):

| Frontend Type | Backend Enum | Status |
|---------------|--------------|--------|
| `BoardStatusSchema` | `BoardStatus` | ✅ Match |
| `UserStatusSchema` | `UserStatus` | ✅ Match |
| `MeetingStatusSchema` | `MeetingStatus` | ✅ Match (camelCase) |
| `DraftSubStatusSchema` | `DraftSubStatus` | ✅ Match |
| `ScheduledSubStatusSchema` | `ScheduledSubStatus` | ✅ Match |
| `CompletedSubStatusSchema` | `CompletedSubStatus` | ✅ Match |
| `LocationTypeSchema` | `LocationType` | ✅ Match |
| `RSVPStatusSchema` | `RSVPStatus` | ✅ Match |
| `VoteStatusSchema` | `VoteStatus` | ✅ Match |
| `VoteOutcomeSchema` | `VoteOutcome` | ✅ Match |
| `MinutesStatusSchema` | `MinutesStatus` | ✅ Match |
| `DocumentStatusSchema` | `DocumentStatus` | ✅ Match |

### ❌ MISSING - Not Using Lookups (Should Be):

| Frontend Type | Backend Lookup | Gap |
|---------------|----------------|-----|
| N/A | `document-categories` | **Missing entirely** - Frontend has no document category types |
| N/A | `agenda-item-types` | **Missing entirely** - Frontend has no agenda item type schema |
| `ResolutionCategorySchema` | `resolution-categories` | ❌ **Frontend hardcoded (6 values), Backend has 7** |

### ⚠️ FRONTEND ONLY (No Backend Equivalent):

| Frontend Type | Purpose | Action Needed |
|---------------|---------|---------------|
| `VotingMethodSchema` | `yes_no`, `yes_no_abstain`, `multiple_choice`, `ranked` | Should this be a lookup? |
| `VoteEntityTypeSchema` | `agenda`, `agenda_item`, `minutes`, `document`, `resolution` | Enum is correct (system types) |
| `PassingRuleSchema` | Duplicate of `VotingThresholdSchema` | **Should use voting-thresholds lookup** |
| `DeviceTypeSchema` | `mobile`, `tablet`, `desktop`, `unknown` | Enum is correct |
| `DocumentEntityTypeSchema` | Polymorphic entity types | Enum is correct |
| `FileTypeSchema` | File extensions | Enum is correct |

---

## Critical Gaps Identified

### 🔴 **High Priority Gaps:**

1. **Zone Mismatch**
   - Frontend: 7 zones (`zone_1` to `zone_7`)
   - Backend: 12 zones (`zone_1` to `zone_12`)
   - **Impact:** Users in zones 8-12 cannot be properly assigned
   - **Fix:** Use `/api/lookups/board-zones`

2. **Missing Meeting Frequency**
   - Frontend: Missing `semi_annual`
   - Backend: Has `semi_annual` (twice per year)
   - **Impact:** Cannot configure semi-annual meetings
   - **Fix:** Use `/api/lookups/meeting-frequencies`

3. **Missing Document Categories**
   - Frontend: No document category types at all
   - Backend: 16 comprehensive categories with icons and colors
   - **Impact:** Cannot properly categorize documents
   - **Fix:** Use `/api/lookups/document-categories`

4. **Missing Agenda Item Types**
   - Frontend: No agenda item type schema
   - Backend: 7 types (`regular`, `approval`, `discussion`, etc.)
   - **Impact:** Cannot properly type agenda items
   - **Fix:** Use `/api/lookups/agenda-item-types`

5. **Resolution Category Mismatch**
   - Frontend: Hardcoded 6 categories (`policy`, `financial`, `operational`, `strategic`, `hr`, `other`)
   - Backend: 7 categories (adds `compliance`)
   - **Impact:** Missing compliance category
   - **Fix:** Use `/api/lookups/resolution-categories`

6. **Duplicate Voting Threshold**
   - Frontend: Has both `VotingThresholdSchema` and `PassingRuleSchema` with same values
   - Backend: Single `voting-thresholds` lookup
   - **Impact:** Duplication and potential inconsistency
   - **Fix:** Remove `PassingRuleSchema`, use voting-thresholds lookup

### 🟡 **Medium Priority:**

7. **Voting Method**
   - Frontend: Hardcoded (`yes_no`, `yes_no_abstain`, `multiple_choice`, `ranked`)
   - Backend: No lookup table
   - **Question:** Should this be configurable via lookup?

---

## Recommended Actions

### Phase 1: Fix Enum Serialization ✅ DONE
- Added `JsonStringEnumConverter` to `Program.cs`
- All enums now serialize as camelCase strings

### Phase 2: Create Lookup Infrastructure (Next)
1. Create `src/api/lookups.api.ts` - API client for all lookup endpoints
2. Create `src/hooks/api/useLookups.ts` - React Query hooks for each lookup
3. Create `src/types/lookup.types.ts` - TypeScript types for lookup responses
4. Create `src/contexts/LookupsContext.tsx` - Global lookup state management

### Phase 3: Migrate Frontend Types
1. **Board Types** - Replace hardcoded with dynamic lookup
2. **Board Zones** - Replace hardcoded with dynamic lookup (fixes 7→12 gap)
3. **Meeting Frequencies** - Replace hardcoded with dynamic lookup (adds `semi_annual`)
4. **Voting Thresholds** - Replace hardcoded with dynamic lookup
5. **Meeting Types** - Replace hardcoded with dynamic lookup
6. **Document Categories** - Add new lookup usage
7. **Agenda Item Types** - Add new lookup usage
8. **Resolution Categories** - Replace hardcoded with dynamic lookup

### Phase 4: Update Components
1. Replace hardcoded dropdown options with lookup data
2. Use `code` as value, `name` as label
3. Leverage metadata (icons, colors, descriptions, sortOrder)
4. Add loading states for lookup data

### Phase 5: Remove Hardcoded Constants
1. Remove `BOARD_TYPE_LABELS` - use lookup `name`
2. Remove `BOARD_TYPE_COLORS` - use lookup metadata or theme
3. Remove duplicate `PassingRuleSchema`
4. Clean up type definitions

---

## Migration Strategy

### Keep as Enums (System States):
- BoardStatus, UserStatus, MeetingStatus
- All SubStatus enums
- LocationType, RSVPStatus, AttendanceStatus
- VoteStatus, VoteOutcome, MinutesStatus
- DocumentStatus, AgendaStatus
- ActionItemStatus, ActionItemPriority
- ResolutionDecision
- DocumentEntityTypeSchema, FileTypeSchema, DeviceTypeSchema

### Migrate to Lookups (Business Configuration):
- BoardType → `board-types` lookup
- Zone → `board-zones` lookup
- MeetingFrequency → `meeting-frequencies` lookup
- VotingThreshold → `voting-thresholds` lookup
- MeetingType → `meeting-types` lookup
- DocumentCategory → `document-categories` lookup (NEW)
- AgendaItemType → `agenda-item-types` lookup (NEW)
- ResolutionCategory → `resolution-categories` lookup

---

## Benefits After Migration

✅ **Single Source of Truth** - Database controls all configurable values
✅ **No Code Deployments** - Add new types without frontend changes
✅ **Consistency** - Same values across backend and frontend
✅ **Rich Metadata** - Icons, colors, descriptions, sort order
✅ **Extensibility** - Easy to add new lookup types
✅ **Maintainability** - Update once in DB, reflects everywhere
✅ **Fixes Critical Gaps** - Resolves zone mismatch, missing categories

---

## Next Steps

1. ✅ Backend enum serialization fixed
2. ⏭️ Create lookup API infrastructure in frontend
3. ⏭️ Implement React Query hooks for lookups
4. ⏭️ Create global lookups context
5. ⏭️ Migrate components to use lookup data
6. ⏭️ Remove hardcoded constants
7. ⏭️ Test and verify all lookup integrations
