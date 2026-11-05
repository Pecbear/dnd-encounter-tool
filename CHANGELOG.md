# D&D Encounter Tool — Changelog

## [1.1.0] - 2026-11-05

### Changes
- Added NPC Pool Page to generate random NPCs
- Added Rumors and Qeusts to generate Rumors and Quests

## [1.0.1] - 2026-08-25

### Changes
- Updated: Character JSON parser to distinguish between raw character data and derived D&D values.
- Fixed: Maximum HP was incorrectly being populated from currentHealth.
- Updated: Maximum HP is now calculated from class HP increases, Constitution modifier, total character level, and applicable HP bonuses.
- Updated: Ability scores now account for applicable race and background adjustments instead of relying solely on the raw abilityScores[].score values.
- Added: Reusable ability-score calculation logic for determining final/effective ability scores.
- Added: Constitution modifier calculation based on the character's final Constitution score.
- Updated: Maximum HP calculation now supports multiclass characters by combining levels and HP increases across all classes.
- Updated: Armor Class calculation to account for equipped armor rather than relying solely on baseArmorClass.
- Updated: Armor calculations now account for Dexterity restrictions imposed by equipped armor.
- Added: Support for applicable character feature bonuses to AC.
- Verified: Warforged Integrated Protection is correctly reflected in AC calculations.
- Verified: Equipped Chain Mail and Integrated Protection correctly produce 17 AC for Errant.
- Verified: Errant's derived character values now correctly resolve to:
>STR 19
>DEX 10
>CON 16
>INT 14
>WIS 14
>CHA 10
>Max HP 31
>AC 17
- Clarified: Current HP, maximum HP, and temporary HP are treated as separate values.
- Improved: Parser architecture is now positioned to handle additional derived D&D statistics without putting all calculation logic directly inside parseCharacterExport().

## [1.0.0] - 2026-08-25

### Changes

- Fixed internal project `start_dev.bat`
- Added automation for project LOCAHOST
- Adjusted CHANGELOG
- Changes to `.gitignore`

## [0.4.0] — August 10, 2026

Major expansion of character management, enemy data, encounter preparation, filtering, and persistent application data. This release also establishes a more structured data architecture for future encounter-generation and management features.

---

## Added

### Character Management

* Added character file import support.
* Added character file parsing for `.hhc` character exports.
* Added persistent character storage.
* Added automatic identification of existing characters during import.
* Added character backup and restore functionality.
* Added support for updating an existing character from an imported character file rather than creating an unnecessary duplicate.

### Enemy System

* Expanded the enemy database with a substantially larger selection of enemies.
* Added enemy progression from **Tier 1 through Tier 6**.
* Added greater variety across low-, mid-, high-, and endgame encounters.
* Added environmental encounter themes including:

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

### Enemy Classification

* Added a dedicated enemy **Type** classification system.
* Added support for the following creature types:

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
* Established **Tier**, **Type**, and **Theme** as separate enemy classifications.

### Enemy Browser & Filtering

* Added enemy filtering by **Tier**.
* Added enemy filtering by **Type**.
* Added enemy filtering by **Theme**.
* Added combined filtering using multiple classification criteria.
* Added dynamically generated filter options based on the current enemy database.
* Added classification information directly to enemy cards.
* Added combat statistics to enemy browser entries.

---

## Improved

### Character Management

* Improved character import handling so imported characters can update the intended existing record.
* Improved character name handling during imports.
* Improved compatibility with imported character data.
* Improved persistent character data handling.

### Encounter Preparation

* Improved encounter setup and enemy selection workflows.
* Improved the organization and presentation of encounter-related information.
* Improved the separation between encounter configuration and live encounter management.

### Player Management

* Improved player data structures and type definitions.
* Improved player management within the application.
* Improved the handling of persistent player information.

### Dashboard

* Improved the dashboard to better support the application's growing set of encounter and character-management features.
* Improved navigation between major application areas.

### Live Encounters

* Improved live encounter management and presentation.
* Improved access to enemy and player information during active encounters.

### UI / UX

* Improved enemy browsing through structured filtering controls.
* Improved filter organization into logical groups.
* Added clear visual states for active filters.
* Improved dynamic updating of enemy results when filters change.
* Improved presentation of enemy classification and combat information.

---

## Fixed

### Character Import

* Fixed an issue where imported characters could overwrite or replace the wrong character.
* Fixed an issue where importing a character could create a new character instance instead of updating the intended existing character.
* Fixed character file parsing and character name handling issues.
* Fixed a compatibility issue involving `crypto.randomUUID()`.

### Data Integrity

* Fixed several cases where imported or generated data could behave as a new instance instead of modifying the intended existing record.
* Improved the use of stable identifiers for persistent game data.

---

## Data & Architecture

* Introduced stronger TypeScript type definitions for application data.
* Improved separation between player, enemy, encounter, and character data.
* Separated enemy **Tier**, **Type**, and **Theme** into independent data properties.
* Added dedicated utility modules for:

  * Character parsing
  * Character persistence
  * Application backup storage
* Improved the application's data architecture to support future filtering, editing, persistence, and encounter-generation features.
* Updated `.gitignore` to prevent generated local character backups from being committed to source control.

---

## Verified

* Production TypeScript compilation completed successfully.
* Production Vite build completed successfully.
* Enemy filtering and classification functionality verified.
* Character importing and updating functionality verified.
* Character persistence and backup functionality verified.
* Existing application functionality remained build-compatible after the data architecture changes.

---

## Release Notes

This release represents a significant expansion of the D&D Encounter Tool beyond its original encounter-management functionality.

The application now has a stronger foundation for managing **players, characters, enemies, encounters, persistent data, and structured enemy classifications**. The new separation between enemy Tier, Type, and Theme is intended to support more advanced encounter browsing and generation in future releases.

The current production version prior to this release is preserved as **v0.3.0**.
