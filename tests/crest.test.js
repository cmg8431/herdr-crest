import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashColor, PALETTE, parseRemote, avatarKey, pickIcon, chooseIcon, initial, normalizeConfig, DEFAULTS,
  memberKey, matches, folderFor, toBlocks, sections, arrange, needsHeaders, toggleFold, assign, renameFolder,
  summarize, topStatus, stackOf, countDirty, parsePr, isTrunk, sortFolders, moveFolder, stepFolder,
} from "../mods/crest/crest.js";

const row = (id, { owner, name, repo, status, tree, space } = {}) => ({
  w: { id, name: space ?? id, status, folder: `/x/${id}`, machine: null },
  g: owner || name || repo ? { owner, name, repo: repo ?? (name ? `["",${JSON.stringify(name)}]` : undefined), avatar: owner } : null,
  tree: tree ?? null,
});

test("hashColor is stable and from the palette", () => {
  assert.equal(hashColor("caddy"), hashColor("caddy"));
  assert.ok(PALETTE.includes(hashColor("anything")));
});

test("parseRemote reads ssh and https remotes on every host", () => {
  assert.deepEqual(parseRemote("git@github.com:mui/base-ui.git"), { host: "github.com", owner: "mui", repo: "base-ui" });
  assert.deepEqual(parseRemote("https://gitlab.com/gitlab-org/gitlab"), { host: "gitlab.com", owner: "gitlab-org", repo: "gitlab" });
  assert.deepEqual(parseRemote("https://codeberg.org/forgejo/forgejo.git\n"), { host: "codeberg.org", owner: "forgejo", repo: "forgejo" });
  assert.equal(parseRemote("https://example.com/a/b"), null);
  assert.equal(parseRemote(""), null);
  assert.equal(parseRemote(undefined), null);
});

test("avatarKey keeps GitHub owners bare", () => {
  assert.equal(avatarKey("github.com", "mui"), "mui");
  assert.equal(avatarKey("gitlab.com", "gitlab-org"), "gitlab.com__gitlab-org");
});

test("pickIcon prefers conventional shallow icons and skips build output", () => {
  assert.equal(pickIcon(["src/x.ts", "public/favicon.svg", "apps/web/public/logo.png"]), "public/favicon.svg");
  assert.equal(pickIcon([".crest.png", "public/favicon.svg"]), ".crest.png");
  assert.equal(pickIcon(["node_modules/a/favicon.svg", "dist/icon.png"]), null);
  assert.equal(pickIcon(["apps/web/public/apple-touch-icon.png", "logo.png"]), "apps/web/public/apple-touch-icon.png");
  assert.equal(pickIcon(["a/b/c/d/e/favicon.svg"]), null);
  assert.equal(pickIcon([]), null);
});

test("chooseIcon follows the mode", () => {
  const all = { custom: null, project: "p", owner: "o" };
  assert.equal(chooseIcon("auto", all), "p");
  assert.equal(chooseIcon("auto", { ...all, project: null }), "o");
  assert.equal(chooseIcon("owner", all), "o");
  assert.equal(chooseIcon("letter", all), null);
  assert.equal(chooseIcon("letter", { ...all, custom: "c" }), "c");
});

test("initial finds the first letter or digit, in any script", () => {
  assert.equal(initial("~"), "~");
  assert.equal(initial(""), "?");
  assert.equal(initial("워커 DB"), "워");
  assert.equal(initial("  base-ui"), "B");
  assert.equal(initial("3d"), "3");
});

test("normalizeConfig keeps good values and drops the rest", () => {
  assert.deepEqual(normalizeConfig(null), { ...DEFAULTS, folders: {}, icons: {} });
  const c = normalizeConfig({ size: 30, radius: 99, dot: "yes", group: "owner", icon: "letter", folders: { Work: ["acme", 3], Empty: [] }, extra: 1 });
  assert.equal(c.size, 30);
  assert.equal(c.radius, 15);
  assert.equal(c.dot, true);
  assert.equal(c.icon, "letter");
  assert.deepEqual(c.folders, { Work: ["acme"] });
  assert.equal("extra" in c, false);
  assert.equal(normalizeConfig({ size: 4 }).size, DEFAULTS.size);
});

test("matches owners, repo names and name prefixes", () => {
  const r = row("a", { owner: "acme", name: "storefront", space: "Landing page" });
  assert.ok(matches("ACME", r));
  assert.ok(matches("storefront", r));
  assert.ok(matches("landing*", r));
  assert.ok(!matches("other", r));
});

test("folderFor: your folders, then rules, then owner", () => {
  const cfg = normalizeConfig({ group: "owner", folders: { Infra: ["caddy"] } });
  const caddy = row("c", { owner: "caddyserver", name: "caddy" });
  const mui = row("m", { owner: "mui", name: "base-ui" });
  const loose = row("n");
  assert.equal(folderFor(caddy, { manual: {}, cfg }), "Infra");
  assert.equal(folderFor(mui, { manual: {}, cfg }), "mui");
  assert.equal(folderFor(loose, { manual: {}, cfg }), null);
  assert.equal(folderFor(mui, { manual: { Mine: { members: [memberKey(mui)] } }, cfg }), "Mine");
  assert.equal(folderFor(mui, { manual: {}, cfg: { ...cfg, group: "none" } }), null);
});

test("toBlocks keeps worktrees with their parent", () => {
  const rows = [row("a"), row("a1", { tree: "├─" }), row("b"), row("b1", { tree: "└─" })];
  assert.deepEqual(toBlocks(rows).map((b) => b.map((r) => r.w.id)), [["a", "a1"], ["b", "b1"]]);
  assert.deepEqual(toBlocks([row("x", { tree: "└─" })]).length, 1);
});

test("sections: pinned, loose, your folders (even empty), then the rest", () => {
  const a = row("a", { owner: "o1", name: "a" });
  const b = row("b", { owner: "o2", name: "b" });
  const c = row("c", { owner: "o1", name: "c" });
  const n = row("n");
  const nameOf = (r) => r.g?.owner ?? null;
  const secs = sections([a, b, n, c], { manual: { Empty: { members: [] } }, pinned: [memberKey(b)], nameOf });
  assert.deepEqual(secs.map((s) => [s.kind, s.name, s.tops.map((r) => r.w.id)]), [
    ["pinned", null, ["b"]],
    ["loose", null, ["n"]],
    ["manual", "Empty", []],
    ["auto", "o1", ["a", "c"]],
  ]);
  assert.deepEqual(arrange([a, b, n, c], { manual: {}, pinned: [], nameOf }).map((r) => r.w.id), ["n", "a", "c", "b"]);
});

test("needsHeaders hides a lone automatic folder", () => {
  assert.equal(needsHeaders([{ name: "mui", kind: "auto" }]), false);
  assert.equal(needsHeaders([{ name: "mui", kind: "auto" }, { name: "x", kind: "auto" }]), true);
  assert.equal(needsHeaders([{ name: "Mine", kind: "manual" }]), true);
  assert.equal(needsHeaders([{ name: null, kind: "loose" }]), false);
});

test("toggleFold and solo", () => {
  assert.deepEqual(toggleFold([], "a", ["a", "b"], false), ["a"]);
  assert.deepEqual(toggleFold(["a"], "a", ["a", "b"], false), []);
  assert.deepEqual(toggleFold([], "a", ["a", "b", "c"], true), ["b", "c"]);
});

test("assign moves a member and never duplicates it", () => {
  let m = assign({}, "k", "A");
  m = assign(m, "k", "B");
  assert.deepEqual(m, { A: { members: [] }, B: { members: ["k"] } });
  assert.deepEqual(assign(m, "k", null), { A: { members: [] }, B: { members: [] } });
});

test("renameFolder keeps order and refuses clashes", () => {
  const m = { A: { members: ["1"] }, B: { members: [] } };
  assert.deepEqual(Object.keys(renameFolder(m, "A", "Z")), ["Z", "B"]);
  assert.equal(renameFolder(m, "A", "B"), m);
  assert.equal(renameFolder(m, "A", ""), m);
});

test("summarize and topStatus", () => {
  const s = summarize([row("a", { status: "done" }), row("b", { status: "blocked" }), row("c", { status: "idle" })]);
  assert.deepEqual(s, { blocked: 1, done: 1, working: 0 });
  assert.equal(topStatus(s), "blocked");
  assert.equal(topStatus({ blocked: 0, done: 0, working: 2 }), "working");
  assert.equal(topStatus({ blocked: 0, done: 0, working: 0 }), null);
});

test("stackOf dedupes pictures", () => {
  const tops = [row("a", { owner: "x" }), row("b", { owner: "x" }), row("c", { owner: "y" }), row("d")];
  assert.deepEqual(stackOf(tops, (r) => r.g?.avatar), ["x", "y"]);
});

test("countDirty counts changed and untracked entries only", () => {
  const out = "# branch.oid abc\n# branch.head main\n1 .M N... 100644 100644 100644 a b f.js\n? new.txt\n2 R. N... x y z w v R100 a\tb\n";
  assert.equal(countDirty(out), 3);
  assert.equal(countDirty(""), 0);
});

test("parsePr maps states", () => {
  assert.deepEqual(parsePr('{"number":7,"state":"OPEN","isDraft":false,"url":"u"}'), { number: 7, state: "open", url: "u" });
  assert.equal(parsePr({ number: 7, state: "OPEN", isDraft: true }).state, "draft");
  assert.equal(parsePr({ number: 7, state: "MERGED" }).state, "merged");
  assert.equal(parsePr("no pull requests found"), null);
});

test("isTrunk", () => {
  assert.ok(isTrunk("main"));
  assert.ok(isTrunk(null));
  assert.ok(!isTrunk("feat/x"));
});

test("folder order: sortFolders, moveFolder, stepFolder", () => {
  const secs = [{ name: null }, { name: "a" }, { name: "b" }, { name: "c" }];
  assert.deepEqual(sortFolders(secs, ["c", "a"]).map((s) => s.name), [null, "c", "a", "b"]);
  assert.deepEqual(moveFolder(["a", "b", "c"], "c", "a"), ["c", "a", "b"]);
  assert.deepEqual(moveFolder(["a", "b", "c"], "a", null), ["b", "c", "a"]);
  assert.deepEqual(stepFolder(["a", "b", "c"], "b", -1), ["b", "a", "c"]);
  assert.deepEqual(stepFolder(["a", "b", "c"], "a", -1), ["a", "b", "c"]);
});

test("folder labels", async () => {
  const { labelFrom, folderLabel } = await import("../mods/crest/crest.js");
  assert.equal(labelFrom({ name: "Caddy" }, "caddyserver"), "Caddy");
  assert.equal(labelFrom({ name: "" }, "mui"), "mui");
  assert.equal(labelFrom({ name: "A very long organization display name here" }, "x"), "x");
  assert.equal(labelFrom(null, "x"), "x");
  assert.equal(folderLabel("mui", { labels: { mui: "MUI" } }), "MUI");
  assert.equal(folderLabel("mui", { renamed: { mui: "UI" }, labels: { mui: "MUI" } }), "UI");
  assert.equal(folderLabel("mui"), "mui");
});

test("removing a folder ungroups its spaces for good", async () => {
  const { removeFolder, folderFor, normalizeConfig, memberKey } = await import("../mods/crest/crest.js");
  const cfg = normalizeConfig({ group: "owner", folders: { Data: ["dlt-hub"] } });
  const dlt = row("d", { owner: "dlt-hub", name: "dlt" });
  const manual = { Data: { members: [memberKey(dlt)] } };
  assert.equal(folderFor(dlt, { manual, cfg }), "Data");
  const after = removeFolder({ manual, hidden: [] }, "Data");
  assert.deepEqual(after.manual, {});
  assert.equal(folderFor(dlt, { manual: after.manual, cfg, hidden: after.hidden }), "dlt-hub");
  const again = removeFolder(after, "dlt-hub");
  assert.equal(folderFor(dlt, { manual: again.manual, cfg, hidden: again.hidden }), null);
});

test("a space taken out of an automatic folder stays out", async () => {
  const { folderFor, normalizeConfig, memberKey } = await import("../mods/crest/crest.js");
  const cfg = normalizeConfig({ group: "owner" });
  const r = row("m", { owner: "mui", name: "base-ui" });
  assert.equal(folderFor(r, { manual: {}, cfg, loose: [memberKey(r)] }), null);
  assert.equal(folderFor(r, { manual: { Mine: { members: [memberKey(r)] } }, cfg, loose: [memberKey(r)] }), "Mine");
});

test("moveToFolder joins a folder or leaves all of them", async () => {
  const { moveToFolder } = await import("../mods/crest/crest.js");
  let st = moveToFolder({ manual: {}, loose: ["k"] }, "k", "mui");
  assert.deepEqual(st, { manual: { mui: { members: ["k"] } }, loose: [] });
  st = moveToFolder(st, "k", null);
  assert.deepEqual(st, { manual: { mui: { members: [] } }, loose: ["k"] });
});

test("folderColors never repeats while colors remain, and keeps yours", async () => {
  const { folderColors, PALETTE } = await import("../mods/crest/crest.js");
  const names = ["Data", "UI", "Infra", "A", "B", "C", "D"];
  const c = folderColors(names, { Infra: "#000000" });
  assert.equal(c.Infra, "#000000");
  assert.equal(new Set(Object.values(c)).size, names.length);
  assert.ok(Object.entries(c).every(([n, v]) => n === "Infra" || PALETTE.includes(v)));
});
