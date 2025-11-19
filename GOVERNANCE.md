GOVERNANCE PRIME AI LAW
AI Operational Framework v4
Owner: Darren Bell
Effective date: 19 Nov 2025
Status: Binding for AI systems only

Purpose
This file governs the behaviour of AI systems inside this repository. It sets strict limits for AI generated edits, file creation, structure, and refactors. Humans are not restricted. Humans may create, move, rename, or delete anything. The AI must remain deterministic, safe, and controlled at all times.

Authority
Only written instructions from Darren Bell override this file.
If an instruction is unclear, the AI must stop and request clarification.
The AI must not act on inference.

Scope
These rules apply only to AI driven changes.
Human developers work without restriction.
AI must never block or alter human GitHub or Firebase actions.

Folder structure
AI must respect the established structure.

src
pages
components
services
utils
styles

Pages contain route level code.
Components contain reusable UI or logic units.
Services contain data access and integration code.
Utils contain pure helpers with no state.
Styles contains global styles and module styles.

AI structural rules
AI must not place loose files into src.
AI must not import across boundaries in a way that breaks the structure.
AI must keep utils pure and side effect free.
AI must not create cross component global styling.

AI file size caps
These caps apply only to AI generated or AI edited files.

Pages or components must not exceed 250 lines.
Hooks or utils must not exceed 200 lines.
Service files must not exceed 300 lines.
CSS modules must not exceed 150 lines.

If the AI is instructed to edit a file that already exceeds its cap, the AI must announce this but continue only if the user approves.

AI splitting rule
When an AI edited file approaches or exceeds its limit:
	1.	Stop and announce that modularisation is required.
	2.	Propose a clean split with clear naming and placement.
	3.	Wait for written approval.
	4.	After approval, create the new file or folder.
	5.	Move only the relevant code.
	6.	Update import paths without rewriting unrelated code.
	7.	Confirm validity and report completion.

Humans may split files freely without AI restrictions.

AI edit protocol
Before editing any file, the AI must confirm:

The file exists.
The edit is explicitly requested.
The file is not frozen.

During editing, the AI must:

Modify only the requested lines or sections.
Avoid changing formatting, imports, or unrelated content.
Avoid refactoring unless instructed.

After editing, the AI must:

Validate syntax.
Validate paths.
Report completion.

Frozen files
Darren Bell may declare any file or folder frozen.
The AI must not modify frozen resources without explicit permission.
Frozen resources are listed in LOCKED_COMPONENTS.md.

AI behaviour around Git
AI must not create branches, merges, tags, or commits unless asked.
AI must not modify commit history.
AI must not interfere with human version control at any stage.

AI behaviour in Firebase
AI must follow Firebase instructions exactly.
AI must not alter Firebase project settings unless instructed.
AI must not block file creation, deletions, or updates requested by the user.
AI must not override human deploy tasks.

Secrets
AI must not output values of secrets.
AI must not store secrets outside approved environment files.
AI must not modify environment files unless instructed.

Import boundaries
Pages may import from components, services, and utils.
Components may import from utils.
Services may import from utils.
Utils may not import from pages, components, or services.

Error handling rules
AI must surface all errors immediately.
AI must not attempt automatic fixes unless instructed.
AI must stop when uncertain.

Failsafe priority
When conflict arises:
	1.	Written instruction from Darren Bell
	2.	This governance file
	3.	Project structural rules

Enforcement
Any AI action that breaches these rules is invalid.
The AI must halt and request instruction.
Human code remains authoritative.