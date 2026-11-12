# Changelog

## 0.4.0 - 2026-11-12

Collapse, calmer rows, and a sidebar that moves.

**Collapse**
- Collapse a space: its worktrees and the lines under it fold into one row that keeps the most urgent status and the worktree count. Use the chevron at the right end of the row, double-click the row, the space or folder menu, or the key commands `crest.collapse`, `crest.collapse-all`, `crest.expand-all` (`keys.json` and `keys.macos.json` suggest keys). `collapse: "idle"` collapses quiet spaces by itself.
- A stand-in repo row folds on click, like a folder. Opening the repo moved to its hover button and menu.
- A folder's spaces sit one step in, on a rail under its glyph.

**Calmer, easier to hit**
- Chevrons of rows and folder headers sit in one column; agents' ages line up with the git tails; lines under a worktree hang from its branch mark.
- Row buttons are bigger and easier to see, with a hover that shows on a hovered row. The row says what a click does while the pointer is on one.
- `↓` on a trunk branch is dim (`behind`). Idle agents show no mark.
- `header: "plain"` for quiet folder headers, `branch: "tooltip"` to keep the branch out of the tail.
- A space with no picture shows one of 18 little pictures (flowers, fruit, sky) instead of a letter (`fill`); **Another picture** in its menu picks a different one.

**Motion**
- Hover washes fade, row buttons slide open, chevrons turn, folds and collapses spring. Buttons dim while pressed. All native, no timers.

**Git and agents**
- The PR number carries one mark for checks failing, changes requested, checks running or approved (`checks`). Running checks are looked at again after 90 seconds.
- Click `↓` to pull (fast-forward only); click the uncommitted dot to open the Changes panel.
- Repos in view are fetched every 10 minutes while the window is in front, so `↓` is current (`fetch`).
- Waiting and finished agents are counted next to "Spaces"; click for the next one (`summary`).
- An agent's sub-agents (started with `hc run`, no pane of their own) show under it; click peeks.

**Other**
- crest.json applies on save.
- Double-clicking a folder no longer opens rename; it is in the folder's menu.
- PR chips of two repos with the same number no longer share an element id.

## 0.3.2 - 2026-11-07

- PR numbers, owner pictures and owner folders for remotes that use an ssh host alias (`git@github-work:owner/repo`), resolved with `ssh -G`. Thanks @olddognewflex (#1).
- `gh pr view` runs through `direnv exec` when direnv is installed, so a repo's `.envrc` can pick the gh account (#1). A branch with no PR is asked once, not twice.
- A PR link opens only if it is `https://`. CI runs with read-only permissions.

## 0.3.1 - 2026-11-06

- Worktrees of one repo group together even when the repo itself isn't open: they sit under a dimmed repo row. Click it to open the repo, `+` for another worktree.

## 0.3.0 - 2026-11-06

- Quick actions on hover: `+` on a folder adds spaces in one click or starts a new space there; `+` on a space opens a terminal, an agent, a worktree or a new space; `×` closes a space or an agent's terminal.
- New folder button at the top of the list.
- Narrow sidebar: folders show as their glyph and fold; worktree rows are smaller.
- Cover sized for the herdr.dev gallery card.
- Simpler menus: folder menu with one-line colors, an inline Move row and a red Remove; space menu with one "Move to folder…" list and settings at the end.
- Narrow sidebar: each folder is a rounded column; only the tile is highlighted.

## 0.2.0 - 2026-11-06

Renamed from spaces-pretty to Crest.

- Project icons from the repo (favicon, app icon, logo), before the owner picture.
- Folders: by owner from the start and named after it, your own folders, drag in and out, drag to reorder, rename, color, fold, remove.
- Busy agents under each space; optional running programs.
- Uncommitted changes dot and pull request number.
- Pin to top.
- Right-click menus for spaces and folders.
- Settings file renamed to `crest.json` (`spaces-pretty.json` is still read).

## 0.1.0

- Owner pictures from GitHub, GitLab, Codeberg and Bitbucket; rounded tiles; status dot.
