# spaces-pretty

A Spaces sidebar where each space wears its GitHub owner's picture, and a repo's worktrees share a color.

## What you see
- Space rows: a 22px rounded (7px) avatar, the space name, then the usual repo/branch/ahead-behind tail.
- Avatar: the GitHub owner picture when origin is on github.com, else a white bold letter (12px) on a repo-colored tile.
- Worktree rows (nested under their repo): a branch icon tinted with the repo color.

## How it behaves
- Color: hash of the repo key into 10 colors (#6366f1 #14b8a6 #f59e0b #ec4899 #22c55e #0ea5e9 #a855f7 #ef4444 #84cc16 #f97316). A color stored in `shared("space.colors")` for that space wins.
- On each git check, read `remote.origin.url`; parse `github.com[:/]<owner>/`; download `https://github.com/<owner>.png?size=96` to `avatars/<owner>.png` under the Herdr home if missing; draw it with `image("avatars/<owner>.png")` (paths resolve against the Herdr home).

## Built from
A clone of the shipped `spaces` mod (`mod.clone`), with the avatar code in `row()` and `check()` changed. Uses `exec`, `image`, `shared`.

## Watch out
- `image()` loads files from the app directory only, not URLs, hence the download.
- Only GitHub is handled; other hosts keep the letter avatar.

## Done when
- A space in a GitHub repo shows the owner picture; a space in `~` shows a colored letter.
- Two worktrees of one repo show the same branch-icon color.
- `herdr-app check mods/spaces-pretty` passes.
