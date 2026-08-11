# D&D Encounter Tool

A web-based tool for Dungeon Masters to manage players and characters, build encounters, and track combat from a single application.

**Live Application:**
https://dnd-encounter-tool.vercel.app/

---

## What Is D&D Encounter Tool?

D&D Encounter Tool is designed to give Dungeon Masters a simple, centralized workspace for preparing and running D&D encounters.

The application focuses on three core workflows:

* **Manage your party** — Keep track of players and their characters.
* **Build encounters** — Select players and enemies and prepare an encounter.
* **Run combat** — Manage an active encounter and track combat information while playing.

The goal is to keep encounter management fast and organized without requiring a collection of separate tools or spreadsheets.

---

# Using the Tool

## 1. Manage Players & Characters

The **Players** section is used to manage the characters participating in your campaign.

You can:

* Add and manage player characters.
* Store character information for future encounters.
* Import supported character files.
* Update an existing character from an imported character file.
* Maintain persistent character information between sessions.
* Create and restore application backups.

Character names are currently used to identify existing characters during the import/update workflow.

---

## 2. Browse the Enemy Database

The **Enemies** section contains the application's enemy database.

Enemies are organized using several independent classifications:

### Tier

Represents the general power level of an enemy.

The current database supports:

**Tier 1 → Tier 6**

### Type

Describes what kind of creature the enemy is.

Current types include:

* Undead
* Humanoid
* Beast
* Monstrosity
* Elemental
* Fiend
* Celestial
* Dragon
* Fey
* Construct
* Aberration
* Giant
* Plant

### Theme

Describes the environment or setting associated with the encounter.

Current themes include:

* Plains
* City
* Crypt
* Inn
* Forest
* Mountain
* Swamp
* Desert
* Coast
* Underdark

### Filtering

Enemies can be filtered using multiple criteria at the same time.

For example, you can search for:

> Tier 3 + Undead + Crypt

This makes it easier to find appropriate enemies while preparing an encounter.

---

# 3. Build an Encounter

The **Encounter Setup** workflow is used to prepare a combat encounter before it begins.

A typical workflow is:

1. Select the participating players.
2. Select the enemies for the encounter.
3. Review the encounter configuration.
4. Start the encounter.

The separation between encounter preparation and live combat allows the DM to configure an encounter before bringing it to the table.

---

# 4. Run a Live Encounter

Once an encounter is ready, it can be moved into the **Live Encounter** view.

The live encounter is intended to be the DM's primary workspace during combat.

It provides access to the relevant player and enemy information needed to manage the encounter while playing.

The application is designed so that encounter preparation and active combat are treated as separate stages:

```text
Players / Characters
        ↓
Enemy Database
        ↓
Encounter Setup
        ↓
Live Encounter
        ↓
Combat Tracking
```

---

# 5. Dashboard

The **Dashboard** provides the central navigation point for the application.

From the dashboard, you can access the major areas of the tool and move between character management, enemy browsing, encounter preparation, and active encounters.

---

# Data & Persistence

The application is designed to retain important game data between sessions.

Persistent data currently includes character and player information used by the application.

The application also includes backup and restore functionality so that important data can be exported and restored when necessary.

Local backup files are intentionally excluded from the Git repository.

---

# Getting Started

## Using the Live Application

No installation is required.

Open:

**https://dnd-encounter-tool.vercel.app/**

The application runs directly in the browser.

---

# Running Locally

If you want to work on the project locally, you will need:

* Node.js
* npm
* Git

Clone the repository and install dependencies:

```bash
git clone https://github.com/Pecbear/dnd-encounter-tool.git
cd dnd-encounter-tool
npm install
```

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

## Production Build

To verify that the application can be built for production:

```bash
npm run build
```

The production build uses TypeScript and Vite.

---

# Project Structure

The project is organized around application screens, game data, and utility systems.

```text
src/
├── data/
│   ├── enemies.ts
│   └── players.ts
│
├── screens/
│   ├── DashboardScreen.tsx
│   ├── EnemiesScreen.tsx
│   ├── EncounterSetupScreen.tsx
│   ├── LiveEncounterScreen.tsx
│   └── PlayersScreen.tsx
│
└── utils/
    ├── backupStorage.ts
    ├── characterParser.ts
    └── characterStorage.ts
```

---

# Development

The project is built with:

* **React**
* **TypeScript**
* **Vite**

The application is hosted through **Vercel** and maintained in **GitHub**.

Development changes are tested locally before being pushed to the production branch.

---

# Releases

Project changes are documented in [`CHANGELOG.md`](CHANGELOG.md).

Major releases are tracked using Git version tags.

The project currently maintains a stable-release workflow in which a known-good production version is tagged before significant changes are introduced.

---

# Current Status

D&D Encounter Tool is an actively developed project.

The application currently focuses on:

* Player management
* Character management
* Character importing
* Character persistence
* Character backup and restore
* Enemy browsing
* Enemy classification
* Enemy filtering
* Encounter building
* Live encounter management
* Combat tracking

Additional encounter-management and Dungeon Master tools will be added as development continues.
