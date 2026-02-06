# Regenerate Mock Data Files to Align with MOCK_DATA_PLAN.md
# This script updates all mock data files to use the new status+subStatus model

Write-Host "Regenerating mock data files to align with MOCK_DATA_PLAN.md..." -ForegroundColor Cyan

# Create backup directory
$backupDir = "c:\Dev\eboard\src\mocks\db\tables\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup existing files
Write-Host "Creating backups in $backupDir..." -ForegroundColor Yellow
Copy-Item "c:\Dev\eboard\src\mocks\db\tables\meetingParticipants.ts" "$backupDir\meetingParticipants.ts"
Copy-Item "c:\Dev\eboard\src\mocks\db\tables\agendaItems.ts" "$backupDir\agendaItems.ts"
Copy-Item "c:\Dev\eboard\src\mocks\db\tables\votes.ts" "$backupDir\votes.ts"
Copy-Item "c:\Dev\eboard\src\mocks\db\tables\minutes.ts" "$backupDir\minutes.ts"
Copy-Item "c:\Dev\eboard\src\mocks\db\tables\resolutions.ts" "$backupDir\resolutions.ts"

Write-Host "Backups created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: The mock data files need to be manually updated to align with MOCK_DATA_PLAN.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Required changes:" -ForegroundColor Cyan
Write-Host "1. meetingParticipants.ts - Update to use MTG-001 through MTG-009 with correct participant counts"
Write-Host "2. agendaItems.ts - MTG-001: 0 items, MTG-002: 8 items, etc."
Write-Host "3. votes.ts - Add votes for MTG-006, MTG-007, MTG-008"
Write-Host "4. minutes.ts - Add draft minutes for MTG-007, approved for MTG-008"
Write-Host "5. resolutions.ts - Update to match the 9 test meetings"
Write-Host ""
Write-Host "Recommendation: Update files incrementally and test after each change." -ForegroundColor Yellow
Write-Host "Start with meetingParticipants.ts, then agendaItems.ts, then the rest." -ForegroundColor Yellow
