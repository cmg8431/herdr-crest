# Changelog

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
