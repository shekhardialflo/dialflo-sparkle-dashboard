

# Dialflo - Voice Assistant Hub Dashboard

A production-grade, minimalist SaaS dashboard for managing voice assistants, campaigns, calls, and analytics.

---

## Visual Design System

- **Background**: Slate-50 (#F8FAFC) with white cards
- **Accent Color**: "Ink" (#111827) - used exclusively for primary CTAs and active states
- **Typography**: Clean, modern - titles 28-32px, headers 18-20px, body 14-16px
- **Style**: Generous whitespace, thin borders (slate-200), subtle shadows, rounded corners
- **Status Pills**: Soft semantic colors (green/blue/yellow/red) for statuses only

---

## App Shell

**Left Sidebar** (narrow, collapsible):
- Dialflo logo at top
- Navigation: Assistants, Campaigns, Calls, Analytics (icons + labels)
- Active state: subtle slate background with thin Ink indicator
- Collapse toggle at bottom

**Header Bar**:
- Balance pill in top-right (e.g., "₹84" subtle badge)
- User avatar/menu

---

## Module 1: Assistants (Default Landing)

**Header Area**:
- Title: "Assistants" with subtitle
- Search bar: "Search assistants..."
- Filters: Type dropdown, Sort dropdown, Grid/List toggle
- Segmented tabs: [Voice Agents] [Insight Agents]
- Primary CTA: "Create Assistant" (Ink button)

**Grid View**:
- Cards with avatar initials, name, direction/language pills
- Stats: call count + last updated
- Test button (secondary) + kebab menu (Test, Clone, History, Analytics, Delete)

**Create Assistant Flow**:
- Modal chooser: Voice Agent vs Insight Agent + channel selection
- 5-step form for Voice Agents (Basics → Voice → Prompt → Variables → Review)
- Voice picker with grid cards
- Variable builder with key/type rows

**Assistant Details Page**:
- Left sub-navigation panel
- Sections: Prompt, Voice, Variables, Knowledge Base, Call Settings, Attach Number
- Advanced: Custom Analysis, Event Subscription, API, DTMF, Tools, Demo Mode, A/B Testing

**Test Call Modal**:
- Tabs: Phone Call | Web Call | Live Chat
- Number selection, callee details
- Start Test Call + Copy cURL buttons

**Insight Agents Tab**:
- Similar grid layout with Insight Agent indicator
- Custom Analysis prompt editor
- Field definition builder (name + type)

---

## Module 2: Campaigns

**Header Area**:
- Title: "Campaigns" with subtitle
- Search bar + "Create Campaign" button
- Sub-tabs: [Campaigns] [Lists]

**Campaigns Table**:
- Columns: Campaign, Assistant, List, Schedule, Status, Metrics (Attempted/Answer Rate/Conversion)
- Status pills: Running, Scheduled, Completed, Draft
- Kebab menu: View details, Pause/Resume, Download results, Delete

**Campaign Details Drawer**:
- Overview: Status, Assistant, List, Schedule
- Performance metrics: Attempted, Connected, Answer Rate (progress bar), Avg Duration, Conversion, Cost
- Insight Agent selector with last run status
- Actions: Download Results, Generate Insights

**Create Campaign Stepper**:
- Step 1: Campaign Settings (name, assistant, numbers, schedule, list, optional insight agent)
- Step 2: Calling List (CSV upload, field mapping, preview)
- Step 3: Review & Launch

**Lists Tab**:
- Table: Name, Records, Updated, Source, Actions
- Create List: CSV upload with name and tags

---

## Module 3: Calls

**Header Area**:
- Title: "Calls" with subtitle
- Search: "Search by phone/name/call id..."
- Date range picker + Export button

**Filters Row**:
- Assistant, Campaign, Status, Direction dropdowns
- Optional toggles: Include Voicemail, Include Retries
- Column visibility control button

**Calls Table**:
- Columns: Called At, Callee (name + phone), Assistant, Campaign, Status, Duration, Cost, Disposition
- Status pills: Connected, Voicemail, Not Answered, Failed
- Row click opens details

**Call Details Drawer**:
- Call summary
- Audio recording player
- Scrollable transcript
- Extracted fields (key-value card from Insight Agent)
- Actions: Re-run Insights, Download JSON, Export

---

## Module 4: Analytics

**Filter Bar**:
- Date range: Last 7/30/90/Custom
- Assistant dropdown, Campaign dropdown
- Include Voicemail toggle

**Tabs**: Overview | Campaigns | Assistants | Insights

**Overview Tab**:
- KPI Cards: Total Attempted, Connected, Not Answered, Converted, Avg Duration
- Calls Over Time chart with 3 lines (Attempted, Connected, Conversion Rate %)
- Disposition breakdown (horizontal bars)
- Top Campaigns table
- Top Assistants table

**Campaigns Tab**:
- Campaign performance table with trend indicators
- Click opens Campaign Details panel

**Assistants Tab**:
- Assistant performance table
- Click opens assistant analytics panel

**Insights Tab**:
- Extracted fields coverage metrics
- Disposition distribution
- Insight Agent runs list with status

---

## Interactions & States

- **Modals/Drawers**: For details, forms, and test calls
- **Stepper Forms**: Multi-step creation wizards
- **Dropdown Filters**: All filter interactions
- **Empty States**: Illustrated placeholders with CTAs
- **Loading Skeletons**: For all data loading states
- **Toast Notifications**: Success/error feedback

---

## Mock Data

- 15-20 realistic voice/insight agents
- 10-15 campaigns with varied statuses
- 50+ call records with realistic data
- Analytics data for charts and metrics

