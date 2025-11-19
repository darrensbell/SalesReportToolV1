GOVERNANCE_PRIME_AI_LAW — UNIVERSAL FRAMEWORK v1

Status: Binding
Owner: Darren Bell
Effective date: 11 Nov 2025

Purpose

This document governs all technical, architectural, and operational activity within the designated repository. It defines the laws of structure, execution, and authorship for human and AI contributors. Non-compliance invalidates resulting work.

The goal is deterministic modularity. Every function, component, or process must exist within a defined folder, serve a singular purpose, and interact through clear, auditable interfaces.

All changes must preserve clarity, traceability, and reversibility.

⸻

Authority
• Only written instructions from Darren Bell authorise structural change.
• No assumption, inference, or contextual correction may override a written command.
• Ambiguity means stop, surface the ambiguity, await instruction.
• Any output created without explicit instruction or in breach of these laws is non-binding.

⸻

Scope and non-deviation
• Operate only inside the current repository and its declared workspace.
• Do not create, rename, or delete top-level resources without written approval.
• Do not alter configurations, environment files, or infrastructure without instruction.
• All logic and state management must remain modular and self-contained within its defined layer.

src/
pages/ # Route or view-level components only
components/ # Reusable UI or logic units
services/ # Data access, I/O, or external integrations
utils/ # Pure functions and stateless helpers
styles/ # Global and modular CSS

Rules
• Subfolders are mandatory. No loose files in src/.
• Each folder defines its own scope, and no scope may reach upward or sideways in violation of import boundaries.
• After any change, perform a path audit to confirm all references are valid.

⸻

Subfolder conventions

src/pages
Purpose: Entry points, routes, or view composition.
• One folder per route or logical view.
• Entry file named index.(jsx|tsx).
• Optional subfolders: parts/, hooks/, Controller.tsx.
• No direct network, file system, or service access.
• Data flows in via props or state managers imported from services.

src/components
Purpose: Reusable interface or logic blocks.
• One folder per component.
• Folder contains index.(tsx|jsx), tests, and local style file.
• Accept data and configuration via props only.
• Contain only UI or logic strictly relevant to presentation.

src/services
Purpose: Data handling, I/O, and integration boundaries.
• One folder per domain or integration (e.g., users/, analytics/, auth/).
• Contain only non-UI operations such as API calls, caching, storage, or computation.
• Return typed, predictable outputs.

src/utils
Purpose: Stateless pure helpers.
• No imports from pages/, components/, or services/.
• No side-effects, no I/O.
• Organise by topic folder: dates/, strings/, math/, etc.

src/styles
Purpose: Styling and theming.
• Only one global.css file permitted.
• Component styles live as \*.module.css alongside their component.
• No cross-component or ad-hoc global styles.

⸻

Naming and file rules
• PascalCase for component and folder names exporting components.
• camelCase for functions, utilities, and service files.
• Hooks must begin with use* and live in a hooks/ folder or beside their consumer.
• Index files may only export a single component or defined public API.
• Test files must follow *.test.(ts|tsx) convention.
• Generic names (final.tsx, temp.js, etc.) are invalid.

⸻

File size caps (mandatory)
• Page or component files: max 250 lines
• Hook or utility files: max 200 lines
• Service files: max 300 lines
• CSS modules: max 150 lines
Exceeding these limits invalidates the file until modularised.

Splitting rule
When a file nears its limit: 1. Halt execution. 2. Announce that modularisation is required. 3. Propose a clean, named split. 4. Apply the split, update imports, verify functionality.

⸻

Refactor and migration protocol

A no-delete migration posture is enforced. The default path is move and adapt, not remove. 1. Plan — Define new locations and expected path changes. 2. Create destination — Make subfolders and placeholder index files first. 3. Move, don’t delete — Keep thin re-export shims until validated. 4. Amend, don’t rewrite — Adjust only what’s necessary for relocation. 5. Update imports — Replace all path references project-wide. 6. Audit paths — Confirm no stale imports remain. 7. Build, typecheck, lint — Must pass cleanly. 8. Runtime smoke test — App must launch without console errors. 9. Deprecation window — Maintain shims until written approval to remove. 10. Removal — Only with explicit written confirmation.

⸻

Dependency direction
• Pages → Components, Services, Utils
• Components → Utils
• Services → Utils
• Utils → nothing outside Utils
Circular dependencies are prohibited.

⸻

Import boundaries
• Pages may import from services, components, and utils.
• Components cannot import from services or perform direct I/O.
• Utilities cannot import from any of the above.
• CSS modules are imported only by their paired component or page.

⸻

Styling rules
• All global styles live in styles/global.css.
• Each component maintains its own local \*.module.css.
• Cross-component styling is forbidden.

⸻

Logging and error handling
• Centralise logging utilities in utils/logging/.
• Services handle and throw errors; pages render and display them.
• Components remain presentational.
• All unexpected errors must be surfaced, not silently absorbed.

⸻

Versioning and change control
• Every configuration or logic change must be committed via Pull Request with a clear version header.
• PRs must pass build, lint, and test checks.
• No auto-merging, silent commits, or skipped code reviews.
• Update REFACTOR_LOG.md for each structural change, detailing old and new paths.
• Maintain concise and factual notes.

⸻

Commit checklist

All must be true before merge:
• Imports fully updated
• No direct service or I/O calls from components
• Build, typecheck, and lint pass cleanly
• Path audit completed and logged
• Runtime smoke test passed
• Re-export shims annotated @deprecated
• REFACTOR_LOG.md updated

⸻

Execution governance
• On any failure, halt immediately and surface the precise error message.
• No silent fixes, retries, or inference.
• No autonomous correction of prior work without written re-authorisation.
• Tasks end deterministically once complete.

⸻

Security and secrets
• Secrets must exist only in environment files (.env.local, .env.production).
• No inline credentials or tokens.
• Use least-privilege access always.

⸻

Auditability
• All automated actions must log to ai_activity.log.
• Format: {timestamp} | {actor} | {action} | {target} | {result}.
• Logs must persist a minimum of ninety days and be immutable.

⸻

Default failsafe

If uncertain, halt execution and request explicit instruction. No assumptions, no self-healing, no extrapolation.

⸻

Change Management Law — Comprehensive Implementation 1. Impact analysis first — Identify all dependants before modifying anything. 2. Atomic execution — Apply related changes as a single atomic operation. 3. Verification before report — Confirm stability and zero errors before declaring completion.

⸻

Quality and consistency laws
• Law of Correctness: All output must be syntactically valid, properly indented, and logically sound.
• Law of Consistency: Names, imports, and casing must match declared project standards.
• Law of Persistence: Maintain accurate awareness of file locations and versions during all tasks.
• Law of Non-recursion: Never self-trigger edits or repeat operations autonomously.
• Law of Immutable output: Once verified, code cannot be revised without written instruction.
• Law of Structural priority: Functionality takes precedence over aesthetic refactor.
• Law of Deterministic completion: Every operation must end in a finalised state.

⸻

Language and formatting
• Use exact spelling, syntax, and casing of existing files.
• Respect indentation and line breaks.
• No automatic re-formatting of JSON, SQL, or JSX.
• Maintain UTF-8 encoding.
• Enforce a single trailing newline at file end.
• No typographic substitutions or smart quotes.

⸻

Operational sanity clause — precedence

If conflict arises: 1. Written instruction from Darren Bell 2. Law of Correctness 3. Law of Consistency 4. Law of Non-recursion 5. All other clauses

⸻

Critical component lockdown

Certain components or modules may be declared frozen. They may not be edited without explicit written override from Darren Bell.

Frozen components are defined in LOCKED_COMPONENTS.md.

⸻

Enforcement
• Any non-conforming PR is rejected.
• Repeated breaches trigger rollback to last valid commit.
• Any detected violation invalidates the output until corrected.
• The AI or contributor must surface any suspected breach immediately and halt pending review.

⸻

This law is the binding framework for modular, deterministic, and reversible code development across all future applications under Darren Bell’s authority.
