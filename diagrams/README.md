# Architecture Diagrams

This folder contains Draw.io diagrams for the Trucking Logistics System.

## 📁 Files

1. **System-Architecture.drawio** - High-level system architecture showing all components
2. **Database-ERD.drawio** - Entity Relationship Diagram for the PostgreSQL database
3. **Terminal-Sync-Flow.drawio** - Detailed flow of how terminal API syncing works

## 🛠️ How to Open These Diagrams

### Option 1: Draw.io Online (Easiest)
1. Go to https://app.diagrams.net
2. Click "Open Existing Diagram"
3. Choose "Device" and select any `.drawio` file from this folder
4. Edit and save back to this folder

### Option 2: VSCode Extension
1. Install the **Draw.io Integration** extension in VSCode
   - Extension ID: `hediet.vscode-drawio`
2. Open any `.drawio` file directly in VSCode
3. Edit inline and save

### Option 3: Desktop App
1. Download from https://github.com/jgraph/drawio-desktop/releases
2. Install the app
3. Open `.drawio` files directly

## 📐 Diagram Details

### System Architecture
Shows the complete tech stack with:
- Frontend layer (Next.js UI components)
- Backend layer (API routes, Server Actions, Prisma)
- Data layer (PostgreSQL + Redis)
- Background jobs (BullMQ workers)
- External terminal APIs
- Data flow connections between components

**Use this when:**
- Onboarding new developers
- Explaining system design to stakeholders
- Planning new features

---

### Database ERD
Shows all database tables and relationships:
- **TRUCKS** (vehicles in the fleet)
- **DRIVERS** (personnel)
- **CONTAINERS** (cargo containers)
- **TERMINALS** (external facilities)
- **TRIPS** (central table connecting trucks, drivers, containers)
- **INVOICES** (billing records tied to trips)
- **RATES** (pricing structure)
- **API_SYNC_LOGS** (audit trail)

**Relationships:**
- 1:N = One-to-Many (one truck has many trips)
- 1:1 = One-to-One (one trip has one invoice)

**Use this when:**
- Writing Prisma schema
- Planning database queries
- Understanding data relationships
- Optimizing indexes

---

### Terminal Sync Flow
Step-by-step visualization of how container data syncs:
1. BullMQ triggers scheduled job
2. Worker calls external terminal API
3. Handles success/failure (with retry logic)
4. Parses JSON response
5. Updates PostgreSQL database
6. Updates Redis cache
7. Logs sync status

**Use this when:**
- Implementing the sync worker
- Debugging sync issues
- Understanding the job queue
- Planning error handling

## 🎨 Color Coding

Each component type has a consistent color scheme:

| Color | Component Type |
|-------|----------------|
| 🔵 Blue | Frontend/UI |
| 🟠 Orange | Backend/API |
| 🟢 Green | Database/Data |
| 🔴 Pink | Background Jobs |
| 🟣 Purple | External APIs |
| 🟡 Yellow | Billing/Financial |

## ✏️ Editing Tips

### Adding New Components
1. Use consistent color scheme (see above)
2. Keep similar spacing between elements
3. Add labels to all connections
4. Update the legend if needed

### Best Practices
- Keep diagrams up-to-date with code changes
- Export as PNG/SVG for documentation if needed
- Use layers to organize complex diagrams
- Add notes for non-obvious connections

## 📤 Exporting

To export diagrams as images:

**In Draw.io:**
- File → Export as → PNG/SVG/PDF
- Choose resolution (2x for retina displays)
- Save to `diagrams/exports/` folder

**In VSCode:**
- Right-click diagram → Export

## 🔄 Keeping Diagrams Updated

When you make significant architecture changes:
1. Update the relevant diagram immediately
2. Commit the `.drawio` file with your code changes
3. Add a note in the commit message: "Updated architecture diagram"

## 📚 Related Documentation

- [../ARCHITECTURE.md](../ARCHITECTURE.md) - Full architecture documentation
- [Future: ../README.md] - Project README (to be created)
- [Future: ../docs/] - Additional documentation (to be created)

---

**Last Updated:** 2026-02-09
