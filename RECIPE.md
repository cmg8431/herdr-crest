# Crest

A Spaces sidebar where each space shows its project's icon and spaces sit in folders, with busy agents and git state shown quietly under and beside each space.

![Crest](preview.png)

## What you see

- **Space row**, 30px: a 24px tile with 8px corners (project icon, else owner picture, else one of 18 full-tile pictures in `art/` (flowers, plants, fruit, sky; flat shapes in soft colors); `fill: "letter"` for a white letter on the repo's color), the name, then a dim tail: repo and branch when unusual, `↑n` `↓n` (`↓` dim on a trunk branch, red elsewhere), a 5px amber dot for uncommitted changes, and `#123` colored by PR state (open green, draft dim, merged violet, closed red), with at most one 10px mark before it: `x` checks failing, a pen for changes requested, a clock for checks running, a check for approved. Last, a 20px slot that every row keeps, so chevrons, tails and buttons stay in columns: a collapsible space's chevron (down on hover when open; when collapsed, always, with a branch mark and how many worktrees it holds).
- **Collapsed space**: its worktrees and lines are not drawn. Its tile's dot shows the most urgent status inside (working included), and the row is on `selected` when the shown space is one of its worktrees.
- **Worktree row**, 28px, under its repo's space: a branch icon in the repo's color.
- **Repo row** (stand-in), 30px, when two or more worktrees of a repo are open but its main checkout isn't: the repo's tile at 60% opacity (its status dot stays solid) and its name in the muted color, the worktrees under it. It is a group, not a space: a click collapses or expands it; hover shows a folder button that opens the main checkout as a space (which then takes its place) and `+` for a new worktree. It takes no place in the space order or Cmd+1..9.
- **Folder header**, 30px, rounded 8px, a raised background: a filled two-tone folder glyph in the folder's color, the name in the normal text color, the count dim, a chevron in a 20px slot on the right (the rows' chevron column). With `header: "plain"`: 26px, no background until hover, a 14px glyph, the name muted, the chevron only when shut or hovered. Shut: up to three 15px tiles of who is inside, and a status dot (blocked pulses).
- **Line under a space**, 24px: a thin rail under the middle of what it hangs from (the tile, or a worktree's branch mark), a status mark (spinner working, pulsing red blocked, green done, nothing for idle, whose text goes dim), the program icon, the agent's title, how long it has been in that state, right-aligned with the tails above.
- **Folder body**: one step in. A 1.5px `border` rail under the middle of the folder glyph (18px in, 15 with `header: "plain"`), the rows 2px right of it. It is drawn even when the folder is shut, in a box whose height slides to 0 (160ms ease-out), and so are a collapsed space's worktrees and lines: what folds moves instead of vanishing. Heights are worked out from the rows (30 a space, 28 a worktree, 24 a line).
- **Sub-agent line**, under its agent, one step in (rail under the agent's status mark): terminals the agent started with `hc run` (`parent`) that have no pane, live, idle ones only with `agents: "all"`. Click peeks (`terminal.peek`).
- **Buttons in a row** (`+`, `×`, the chevron, `↓`, the dirty dot, the PR number): 22×24 (git marks 20 tall), `muted`, on hover a 12% wash of the text color (so they show on a hovered row too), dimmed while pressed. While one is under the pointer, the row's tail says what a click does instead of a tooltip.
- **Motion**, all native (`transition`/`spring`, never a timer): hover washes fade in 120ms; a row's `+ ×` slide open by width so the tail glides aside; chevrons crossfade right and down; a collapsed space's count slides in; folding and collapsing spring (240ms, no overshoot) so a second click halfway turns back smoothly; on an agent line the age fades out and `×` fades in over it.
- **Summary**, next to "Spaces": a pill per kind (blocked, done) with a 6px dot and a count, only when above zero. Click goes to the next such agent.
- Pinned and folderless spaces come first, without a header.

## How it behaves

- Folder for a space: your folder (by repo, so worktrees follow) > not if you took it out > a rule in `crest.json` > the owner when `group` is `"owner"` > none. Headers show only when there is more than one folder or one of yours.
- Owner folders are named from `api.github.com/users/<owner>` (display name if 24 chars or less) unless you renamed them.
- Colors: yours if set, else a hue from the name, moved to the next palette color so no two folders match.
- A space collapses with its chevron, a double-click on its row, its menu, a folder's menu (all of its spaces), or the key commands `crest.collapse`, `crest.collapse-all`, `crest.expand-all`. With `collapse: "idle"` every quiet space (no agent working, blocked or done, not the shown one) collapses too, unless opened by hand; opened by hand lasts until it gets busy.
- `↓` pulls with `git pull --ff-only` (prompts off); the dirty dot brings the space in front with the Changes panel (`layout.select` on `panel-body`, then `layout.show` on `panel`).
- crest.json is watched and applies on save.
- With `fetch` on (default), each local repo in view with a known remote gets `git fetch` at most every 10 minutes while the window is in front, never while a space in it has a working agent; the folder watch then picks up the new refs and `↓` moves.
- Click a header to fold, Alt+click to keep only it open. Drag a header onto another to place it before; onto the space below the last folder to place it last. Drag a space onto a header, among another folder's spaces, or below the last folder to move it.
- Folders rename from their menu only; a click folds.
- Right-click a space: pin, move to a folder, new folder, take out of folder, worktree actions, rename, close. Right-click a folder: rename, color, move up or down, fold the others, unfold all, settings, remove (yours are deleted, automatic ones turned off; spaces stay).
- The picture is picked by a hash of the space's repo or folder; "Another picture" moves it one on (`crest.art`: key -> shift). `tools/art.py` draws them: hand-placed shapes and plain fills, no filters, so they render the same everywhere.
- State lives in shared values `crest.folders`, `crest.order`, `crest.folded`, `crest.pinned`, `crest.loose`, `crest.hidden`, `crest.names`, `crest.colors`, `crest.labels`, `crest.shut` (collapsed spaces, by memberKey), `crest.art` and `crest.open` (opened by hand under `collapse: "idle"`).
- Spaces are moved (`space.move`) so `Cmd+1..9` follows the sidebar.

## Keys

`keys.json` (Linux, Windows) and `keys.macos.json` suggest bindings for `crest.collapse`, `crest.collapse-all` and `crest.expand-all`, picked to not clash with Herdr's own (`Cmd+[`/`]`, `Cmd+Alt+[`/`]`, `Cmd+Shift+[`/`]`). Merge their `global` entries into `~/.config/herdr-app/keys.json`.

## Built from

`mod.clone` of the shipped `spaces` mod (0.1.13). `crest.js`: pure logic (remote parsing, icon choice, config, folders, colors, PR and dirty parsing), tested with `node --test`. `ui.js`: tiles, headers, lines. `menu.js`: the right-click menu, drawn by the same mod opened as a popup with `props.crestMenu`. `fetch-avatar.sh`: owner pictures into `crest-cache/`. Herdr functions used: `spaces`, `panes`, `agents`, `exec`, `shared`/`setShared`, `openOverlay`, `run` (`space.select`, `space.move`, `space.rename`, `space.close`, `pane.focus`). Programs it runs: `git`, `gh pr view` (through `direnv exec` when direnv is installed), `ssh -G` for a remote with an ssh host alias (never an alias starting with `-`), `curl`.

## Watch out

- `image()` reads files under the Herdr home only, so every picture is copied into `crest-cache/` first.
- Importing from another mod's folder is not allowed; keep the menu inside the mod.
- A new folder in `mods/` without `mod.json` `"place": "none"` gets added to the shown layout as a block.
- There is no mouse-up outside the list; leaving the list ends a drag.
- Model and context use are not in Herdr's agent data, so lines show the title and time only.

## Done when

- A space in a repo with `public/favicon.svg` shows that icon; one with only a GitHub remote shows the owner picture; `~` shows a letter.
- With spaces from two owners, two headers appear, named after the owners; dragging one header onto the other swaps them, and the order survives a restart.
- Dragging a space onto another folder's header moves it there with its worktrees.
- A branch with an open PR shows its number; clicking it opens the PR.
- Collapsing a repo with two worktrees leaves one row with a branch mark and `2`; the order of spaces and Cmd+1..9 don't change.
- `herdr-app do crest.collapse-all` collapses every space with something under it; `crest.expand-all` opens them.
- `node --test` and `herdr-app check mods/crest` pass.
