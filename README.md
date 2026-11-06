# spaces-pretty

A Herdr mod: a nicer Spaces sidebar.

- Each space shows the GitHub owner's picture (org logo or user photo) as its avatar.
- Spaces without a GitHub remote get a colored letter. The color comes from the repo, so a repo and its worktrees share one color.
- Worktree rows get a branch icon tinted with the repo color.
- Colors you set yourself (`space.colors`) still win.

## Install

Copy `mods/spaces-pretty/` to `~/.config/herdr-app/mods/`, then point your layout at it
(`"mod": "spaces-pretty"` instead of `"spaces"`). Do this in a layout you cloned
(`herdr-app do layout.clone '{"name":"main","as":"mine"}'`), not in a shipped one.

## What it runs and fetches

- `git config --get remote.origin.url` in each space's folder, to find the GitHub owner.
- `curl https://github.com/<owner>.png?size=96`, saved to `~/.config/herdr-app/avatars/<owner>.png`
  once per owner. Nothing else leaves your machine. Delete the file to refresh a picture.

## License

Apache-2.0. Based on Herdr's own `spaces` mod, see NOTICE.
