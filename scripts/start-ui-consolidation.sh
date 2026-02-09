#!/bin/bash

# UI CONSOLIDATION - QUICK START SCRIPT
# Run this to begin the consolidation process

echo "=========================================="
echo "TesoTunes UI Consolidation - Quick Start"
echo "Target: January 10, 2025 Launch"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Backup current state
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
BACKUP_DIR="backups/ui-consolidation-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r resources/views/frontend "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"
echo ""

# Step 2: Check current layout usage
echo -e "${YELLOW}Step 2: Auditing current layout usage...${NC}"
echo ""
echo "Layout Distribution:"
echo "-------------------"
grep -r "@extends" resources/views/frontend/*.blade.php 2>/dev/null | awk -F: '{print $2}' | sort | uniq -c | while read count layout; do
    echo "  $count pages using $layout"
done
echo ""

grep -r "@extends" resources/views/frontend/store/*.blade.php 2>/dev/null | awk -F: '{print $2}' | sort | uniq -c | while read count layout; do
    echo "  $count store pages using $layout"
done

grep -r "@extends" resources/views/frontend/sacco/*.blade.php 2>/dev/null | awk -F: '{print $2}' | sort | uniq -c | while read count layout; do
    echo "  $count SACCO pages using $layout"
done

grep -r "@extends" resources/views/frontend/artist/*.blade.php 2>/dev/null | awk -F: '{print $2}' | sort | uniq -c | while read count layout; do
    echo "  $count artist pages using $layout"
done
echo ""

# Step 3: Count total pages
echo -e "${YELLOW}Step 3: Counting pages to migrate...${NC}"
TOTAL_PAGES=$(find resources/views/frontend -name "*.blade.php" -type f | wc -l)
echo -e "${GREEN}Total pages: $TOTAL_PAGES${NC}"
echo ""

# Step 4: Check if master layout exists
echo -e "${YELLOW}Step 4: Checking for master layout...${NC}"
if [ -f "resources/views/frontend/layouts/master.blade.php" ]; then
    echo -e "${GREEN}✓ Master layout already exists${NC}"
else
    echo -e "${RED}✗ Master layout not found${NC}"
    echo "  You need to create: resources/views/frontend/layouts/master.blade.php"
    echo "  See IMPLEMENTATION_GUIDE_JAN10.md for template"
fi
echo ""

# Step 5: Check required partials
echo -e "${YELLOW}Step 5: Checking required partials...${NC}"
PARTIALS=(
    "resources/views/frontend/partials/header.blade.php"
    "resources/views/frontend/partials/mobile-bottom-nav.blade.php"
)

for partial in "${PARTIALS[@]}"; do
    if [ -f "$partial" ]; then
        echo -e "${GREEN}✓ Found: $partial${NC}"
    else
        echo -e "${YELLOW}⚠ Missing: $partial${NC}"
    fi
done
echo ""

# Step 6: Git status check
echo -e "${YELLOW}Step 6: Checking Git status...${NC}"
if [ -d ".git" ]; then
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✓ Working directory clean${NC}"
    else
        echo -e "${YELLOW}⚠ You have uncommitted changes${NC}"
        echo "  Consider committing before starting migration"
    fi
else
    echo -e "${RED}✗ Not a Git repository${NC}"
fi
echo ""

# Step 7: Create progress tracker
echo -e "${YELLOW}Step 7: Creating progress tracker...${NC}"
if [ ! -f "DAILY_PROGRESS_JAN10.md" ]; then
    cat > DAILY_PROGRESS_JAN10.md << 'EOF'
# Daily Progress Tracker - January 10 Launch

## December 28, 2024
- [ ] Created master layout
- [ ] Created section layouts (music, store, sacco)
- [ ] Migrated home page
- [ ] Migrated timeline page
- **Pages Migrated:** 0/128
- **Status:** 🔄 In Progress

## December 29, 2024
- [ ] Migrate music pages
- **Target:** 10 pages
- **Status:** ⏳ Pending

## December 30, 2024
- [ ] Complete music section
- **Target:** All remaining music pages
- **Status:** ⏳ Pending

---

## Migration Log
| Date | Page | Layout Used | Status | Notes |
|------|------|-------------|--------|-------|
| Dec 28 | home.blade.php | layouts.music | ✅ | - |

EOF
    echo -e "${GREEN}✓ Created DAILY_PROGRESS_JAN10.md${NC}"
else
    echo -e "${GREEN}✓ Progress tracker already exists${NC}"
fi
echo ""

# Step 8: Show next steps
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "NEXT STEPS:"
echo "-----------"
echo "1. Review the consolidation plan:"
echo "   cat UI_CONSOLIDATION_PLAN_JAN10.md"
echo ""
echo "2. Review implementation guide:"
echo "   cat IMPLEMENTATION_GUIDE_JAN10.md"
echo ""
echo "3. Create master layout (if not exists):"
echo "   # See IMPLEMENTATION_GUIDE_JAN10.md Step 1"
echo ""
echo "4. Start migrating pages (recommended order):"
echo "   - home.blade.php"
echo "   - timeline.blade.php"
echo "   - dashboard.blade.php"
echo ""
echo "5. Test each page after migration:"
echo "   php artisan serve"
echo "   # Visit: http://localhost:8000/[page]"
echo ""
echo "6. Track progress daily:"
echo "   # Update DAILY_PROGRESS_JAN10.md"
echo ""
echo "=========================================="
echo "USEFUL COMMANDS:"
echo "=========================================="
echo "# Clear caches:"
echo "  php artisan optimize:clear"
echo ""
echo "# Check page count:"
echo "  ./scripts/count-migrated-pages.sh"
echo ""
echo "# Run tests:"
echo "  php artisan test"
echo ""
echo "# Create backup:"
echo "  ./scripts/backup-views.sh"
echo ""
echo "=========================================="
echo -e "${YELLOW}Days until launch: 13${NC}"
echo -e "${YELLOW}Pages to migrate: $TOTAL_PAGES${NC}"
echo -e "${YELLOW}Target: ~10 pages per day${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}Good luck! You've got this! 🚀${NC}"
echo ""
