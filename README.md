<img src="preview.png" alt="Crest" width="100%">

# Crest

A Spaces sidebar for [Herdr](https://herdr.dev). Each space shows its project's icon, and spaces sit in folders.

[![ci](https://github.com/cmg8431/herdr-crest/actions/workflows/ci.yml/badge.svg)](https://github.com/cmg8431/herdr-crest/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![herdr mod](https://img.shields.io/badge/herdr-mod-5b8def.svg)](https://herdr.dev/mods)

<table>
<tr>
<td><img src="assets/sidebar-dark.png" width="380" alt="Crest, dark"></td>
<td valign="top"><img src="assets/sidebar-light.png" width="380" alt="Crest, light, folders closed"></td>
</tr>
</table>

## What it does

- **Icons.** The project's own icon if the repo has one (favicon, app icon, logo), else the owner's picture from GitHub, GitLab, Codeberg or Bitbucket, else a letter.
- **Folders.** Spaces are grouped by owner from the start, named after the owner (`caddyserver` shows as Caddy). Make your own folders, drag spaces in and out, drag folders to reorder, rename them, pick a color, close them. A closed folder still shows who is inside and whether an agent there needs you.
- **What's running.** Under a space, its busy agents (and, if you want, dev servers). Click one to jump to it.
- **Git at a glance.** Branch, ahead and behind, a dot for uncommitted changes, and the pull request number in its state's color. Click the number to open it.
- **Pin** a space to keep it at the top.

**Quick actions, no dragging.** Hover a folder and press `+` to put spaces in it with one click each, or start a new space there. Hover a space for `+` (a terminal, an agent, a worktree or a new space) and `×` to close it. Hover an agent line for `×`. The folder button next to `+` at the top makes a new folder.

Right-click a space or a folder for everything else. Alt+click a folder to keep only that one open. In a narrow sidebar, each folder is a rounded column of tiles that still folds.

## Install

```sh
git clone https://github.com/cmg8431/herdr-crest
cd herdr-crest
./install.sh
```

This copies the mod into `~/.config/herdr-app/mods/crest`, clones your `main` layout as `crest` with the spaces list swapped for Crest, and switches to it. Shipped mods and layouts are not touched, so Herdr updates won't overwrite it. `Cmd+Shift+L` switches back. To use another layout as the base: `./install.sh <layout>`.

## Settings

Optional. Right-click a folder, then **Settings…**, or create `~/.config/herdr-app/crest.json`. Everything has a default; see [crest.example.json](crest.example.json).

| key | default | |
| --- | --- | --- |
| `group` | `"owner"` | `"owner"` groups by owner, `"none"` only uses your folders |
| `icon` | `"auto"` | `"auto"` project then owner, `"project"`, `"owner"`, `"letter"` |
| `size`, `radius` | `24`, `8` | tile size and corner radius in px |
| `dot` | `true` | blocked and done dot on the tile |
| `pr` | `true` | pull request number (needs `gh`) |
| `dirty` | `true` | dot for uncommitted changes |
| `agents` | `"active"` | agents under a space: `"active"`, `"all"`, `"none"` |
| `programs` | `false` | also list running programs such as dev servers |
| `folders` | `{}` | folders by rule: owner, repo name, or a name prefix like `"exp-*"` |
| `icons` | `{}` | your own picture for a repo: `{ "repo": "/path/icon.png" }` |

Re-open the layout after editing (`Cmd+Shift+L` twice).

## What it runs

Per space, locally: `git status`, `git config --get remote.origin.url`, `git ls-files` (to find a project icon).
Once per owner: `curl` to the git host for the owner's picture, and to `api.github.com/users/<owner>` for the folder name.
Per branch with `pr` on, at most every 5 minutes: `gh pr view`. Pictures are cached in `~/.config/herdr-app/crest-cache/`. Nothing else leaves your machine.

## Development

`mods/crest/crest.js` holds the logic and has no Herdr imports; `node --test` runs its tests. `ui.js` draws, `menu.js` is the right-click menu, `main.js` is Herdr's own `spaces` mod with crest wired in. Check a change with `herdr-app check mods/crest`.

Tested on macOS.

## License

Apache-2.0. `main.js` is based on Herdr's `spaces` mod, see [NOTICE](NOTICE).
