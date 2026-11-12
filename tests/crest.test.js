import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashColor, PALETTE, parseRemote, sshAlias, sshHostname, withHost, noPr, avatarKey, pickIcon, chooseIcon, initial, normalizeConfig, DEFAULTS,
  memberKey, matches, folderFor, toBlocks, sections, arrange, needsHeaders, toggleFold, assign, renameFolder,
  summarize, topStatus, stackOf, countDirty, parsePr, isTrunk, sortFolders, moveFolder, stepFolder, nest, mainTop,
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

test("sshAlias finds host aliases parseRemote can't read", () => {
  assert.equal(sshAlias("git@github-work:acme/api.git"), "github-work");
  assert.equal(sshAlias("github-work:acme/api\n"), "github-work");
  assert.equal(sshAlias("git@github.com:mui/base-ui.git"), null);
  assert.equal(sshAlias("https://example.com/a/b"), null);
  assert.equal(sshAlias("ssh://git@example.com:22/a/b"), null);
  assert.equal(sshAlias("/srv/git/repo.git"), null);
  assert.equal(sshAlias(""), null);
  assert.equal(sshAlias(undefined), null);
  assert.equal(sshAlias("git@-Fevil:o/r"), null, "never an alias ssh would take as an option");
});

test("noPr tells gh's 'no PR here' from a failure worth retrying", () => {
  assert.equal(noPr('no pull requests found for branch "feat/x"'), true);
  assert.equal(noPr("direnv: error /x/.envrc is blocked. Run `direnv allow` to approve its content"), false);
  assert.equal(noPr("GraphQL: Could not resolve to a Repository with the name 'o/r'."), false);
  assert.equal(noPr(undefined), false);
});

test("sshHostname reads ssh -G and withHost swaps the alias out", () => {
  assert.equal(sshHostname("user git\nhostname github.com\nport 22\n"), "github.com");
  assert.equal(sshHostname(""), null);
  assert.deepEqual(parseRemote(withHost("git@github-work:acme/api.git", "github-work", "github.com")), { host: "github.com", owner: "acme", repo: "api" });
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
  assert.deepEqual(parsePr('{"number":7,"state":"OPEN","isDraft":false,"url":"https://g/p/7"}'), { number: 7, state: "open", url: "https://g/p/7", checks: null, review: null });
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

const wt = (id, repo, linked, machine = null) => ({ w: { id, name: id, machine }, i: 0, g: { repo: JSON.stringify([machine, `/c/${repo}/.git`]), name: repo, linked, owner: "o" } });

test("nest puts worktrees under their open main checkout", () => {
  const out = nest([wt("main", "app", false), wt("a", "app", true), wt("x", "other", false), wt("b", "app", true)]);
  assert.deepEqual(out.map((r) => [r.w.id, r.tree]), [["main", null], ["a", "├─"], ["b", "└─"], ["x", null]]);
  assert.ok(out.every((r) => !r.ghost));
});

test("nest groups worktrees of a repo whose main checkout isn't open under a stand-in", () => {
  const out = nest([wt("home", "dots", false), wt("a", "app", true), wt("b", "app", true), wt("solo", "lib", true), wt("c", "app", true)]);
  assert.deepEqual(out.map((r) => [r.w.id, r.tree]), [["home", null], ["ghost:" + wt("a", "app").g.repo, null], ["a", "├─"], ["b", "├─"], ["c", "└─"], ["solo", null]]);
  const ghost = out[1];
  assert.equal(ghost.ghost, true);
  assert.equal(ghost.w.name, "app");
  assert.equal(ghost.w.folder, "/c/app");
  assert.equal(ghost.first, "a");
  assert.equal(memberKey(ghost), memberKey(out[2]), "the stand-in and its worktrees file into the same folder");
});

test("mainTop reads the checkout from the git-common-dir key", () => {
  assert.equal(mainTop(JSON.stringify([null, "/u/code/app/.git"])), "/u/code/app");
  assert.equal(mainTop(JSON.stringify([null, "/u/code/app.git"])), null);
  assert.equal(mainTop("nope"), null);
});

test("hashKey gives distinct cache names for paths of the same length", async () => {
  const { hashKey } = await import("../mods/crest/crest.js");
  const a = hashKey("/code/worktrees/web/fix-a"), b = hashKey("/code/worktrees/web/fix-b");
  assert.notEqual(a, b);
  assert.equal(a, hashKey("/code/worktrees/web/fix-a"));
  assert.match(a, /^[0-9a-f]{8}$/);
});

test("parsePr only keeps https links, since the chip opens them", () => {
  assert.equal(parsePr({ number: 7, state: "OPEN", url: "https://github.com/o/r/pull/7" }).url, "https://github.com/o/r/pull/7");
  assert.equal(parsePr({ number: 7, state: "OPEN", url: "file:///Applications/Calculator.app" }).url, null);
  assert.equal(parsePr({ number: 7, state: "OPEN" }).url, null);
});

// ---------------------------------------------------------------- 0.4: collapsing, quieter tails, PR checks, summary

test("normalizeConfig reads the 0.4 keys and drops bad values", async () => {
  const { normalizeConfig, DEFAULTS } = await import("../mods/crest/crest.js");
  assert.equal(DEFAULTS.behind, true);
  assert.equal(DEFAULTS.branch, "tail");
  assert.equal(DEFAULTS.header, "pill");
  assert.equal(DEFAULTS.collapse, "manual");
  const c = normalizeConfig({ behind: "branch", branch: "tooltip", header: "plain", collapse: "idle", checks: false, summary: false });
  assert.deepEqual([c.behind, c.branch, c.header, c.collapse, c.checks, c.summary], ["branch", "tooltip", "plain", "idle", false, false]);
  const bad = normalizeConfig({ behind: "yes", branch: "hide", header: "bar", collapse: "always", checks: 1 });
  assert.deepEqual([bad.behind, bad.branch, bad.header, bad.collapse, bad.checks], [true, "tail", "pill", "manual", true]);
  assert.equal(normalizeConfig({ behind: false }).behind, false);
});

test("collapseRows hides a collapsed space's worktrees and speaks for them", async () => {
  const { collapseRows, nest, memberKey } = await import("../mods/crest/crest.js");
  const rows = nest([wt("main", "app", false), wt("a", "app", true), wt("b", "app", true), wt("x", "other", false)]);
  rows[2].w.status = "blocked";
  rows[1].w.active = true;
  const open = collapseRows(rows, () => false);
  assert.deepEqual(open.map((r) => [r.w.id, r.kids ?? null, Boolean(r.shut)]), [["main", 2, false], ["a", null, false], ["b", null, false], ["x", 0, false]]);
  const key = memberKey(rows[0]);
  const shut = collapseRows(rows, (top) => memberKey(top) === key);
  assert.deepEqual(shut.map((r) => r.w.id), ["main", "x"]);
  assert.equal(shut[0].shut, true);
  assert.equal(shut[0].hidden, 2);
  assert.equal(shut[0].hiddenStatus, "blocked");
  assert.equal(shut[0].holdsActive, true);
  assert.equal(shut[1].shut, undefined, "another repo stays open");
});

test("collapseRows: a collapsed space's own agents count too, and a stand-in collapses like a repo", async () => {
  const { collapseRows, nest } = await import("../mods/crest/crest.js");
  const solo = [{ w: { id: "s", name: "s", status: "working", machine: null }, i: 0, g: null }];
  assert.equal(collapseRows(solo, () => true)[0].hiddenStatus, "working");
  const rows = nest([wt("a", "app", true), wt("b", "app", true)]);
  const out = collapseRows(rows, (top) => Boolean(top.ghost));
  assert.equal(out.length, 1);
  assert.equal(out[0].ghost, true);
  assert.equal(out[0].hidden, 2);
});

test("isShut, toggleShut and shutMany: manual and idle", async () => {
  const { isShut, toggleShut, shutMany, quiet } = await import("../mods/crest/crest.js");
  assert.equal(isShut("k", { shut: ["k"] }), true);
  assert.equal(isShut("k", { shut: [], idle: true }), false, "manual mode never collapses on its own");
  assert.equal(isShut("k", { shut: [], mode: "idle", idle: true }), true);
  assert.equal(isShut("k", { shut: [], open: ["k"], mode: "idle", idle: true }), false, "opened by hand stays open");
  assert.equal(isShut("k", { shut: [], mode: "idle", idle: false }), false, "busy spaces stay open");

  assert.deepEqual(toggleShut({ shut: [], open: ["k"] }, "k", false), { shut: ["k"], open: [] });
  assert.deepEqual(toggleShut({ shut: ["k"], open: [] }, "k", true), { shut: [], open: ["k"] });
  assert.deepEqual(shutMany({ shut: ["a"], open: ["b"] }, ["a", "b"], true), { shut: ["a", "b"], open: [] });
  assert.deepEqual(shutMany({ shut: ["a", "c"], open: [] }, ["a", "b"], false), { shut: ["c"], open: ["a", "b"] });

  assert.equal(quiet([{ w: { status: "idle" } }, { w: {} }]), true);
  assert.equal(quiet([{ w: { status: "idle" } }, { w: { status: "done" } }]), false);
  assert.equal(quiet([{ w: { active: true } }]), false, "the shown space never collapses on its own");
});

test("rollup and review read gh's PR fields", async () => {
  const { rollup, review } = await import("../mods/crest/crest.js");
  assert.equal(rollup([]), null);
  assert.equal(rollup(undefined), null);
  assert.equal(rollup([{ status: "COMPLETED", conclusion: "SUCCESS" }, { state: "SUCCESS" }]), "pass");
  assert.equal(rollup([{ status: "COMPLETED", conclusion: "SKIPPED" }, { status: "COMPLETED", conclusion: "NEUTRAL" }]), "pass");
  assert.equal(rollup([{ status: "IN_PROGRESS", conclusion: "" }, { status: "COMPLETED", conclusion: "SUCCESS" }]), "pending");
  assert.equal(rollup([{ state: "PENDING" }]), "pending");
  assert.equal(rollup([{ status: "IN_PROGRESS" }, { status: "COMPLETED", conclusion: "FAILURE" }]), "fail", "a failure wins over running checks");
  assert.equal(rollup([{ state: "ERROR" }]), "fail");
  assert.equal(rollup([{ status: "COMPLETED", conclusion: "CANCELLED" }]), "pass", "cancelled is not a failure, as in gh pr checks");
  assert.equal(review("APPROVED"), "approved");
  assert.equal(review("CHANGES_REQUESTED"), "changes");
  assert.equal(review("REVIEW_REQUIRED"), "required");
  assert.equal(review(""), null);
});

test("parsePr keeps checks and review for open PRs only; prMark picks one mark", async () => {
  const { parsePr, prMark, prTip, prTtl } = await import("../mods/crest/crest.js");
  const open = parsePr({ number: 3, state: "OPEN", statusCheckRollup: [{ status: "COMPLETED", conclusion: "FAILURE" }], reviewDecision: "APPROVED" });
  assert.deepEqual([open.checks, open.review], ["fail", "approved"]);
  const merged = parsePr({ number: 3, state: "MERGED", statusCheckRollup: [{ state: "FAILURE" }], reviewDecision: "APPROVED" });
  assert.deepEqual([merged.checks, merged.review], [null, null]);

  assert.equal(prMark({ checks: "fail", review: "changes" }), "fail");
  assert.equal(prMark({ checks: "pending", review: "changes" }), "changes");
  assert.equal(prMark({ checks: "pending", review: "approved" }), "pending");
  assert.equal(prMark({ checks: "pass", review: "approved" }), "approved");
  assert.equal(prMark({ checks: "pass", review: "required" }), null, "nothing wrong: no mark");
  assert.equal(prMark(null), null);

  assert.equal(prTip({ number: 3, state: "open", checks: "fail", review: "changes" }), "PR #3, open · checks failing · changes requested");
  assert.equal(prTip({ number: 3, state: "merged", checks: null, review: null }), "PR #3, merged");
  assert.ok(prTtl({ checks: "pending" }) < prTtl({ checks: "pass" }));
  assert.equal(prTtl(null), prTtl({ checks: "pass" }));
});

test("behindTone: a trunk behind is dim, a branch behind is worth seeing", async () => {
  const { behindTone } = await import("../mods/crest/crest.js");
  assert.equal(behindTone(true, "main", 102), "dim");
  assert.equal(behindTone(true, "feat/x", 3), "alert");
  assert.equal(behindTone("branch", "main", 102), null);
  assert.equal(behindTone("branch", "feat/x", 3), "alert");
  assert.equal(behindTone(false, "feat/x", 3), null);
  assert.equal(behindTone(true, "feat/x", 0), null);
});

test("placeText: only what the name doesn't say; tooltip mode moves the branch out of the tail", async () => {
  const { placeText } = await import("../mods/crest/crest.js");
  assert.deepEqual(placeText({ name: "web", repo: "web", branch: "main" }), { tail: "", tip: null });
  assert.deepEqual(placeText({ name: "Manager UX", repo: "inpock-frontend", branch: "hotfix/manager", tree: "└─" }), { tail: "hotfix/manager", tip: "hotfix/manager" });
  assert.deepEqual(placeText({ name: "notes", repo: "web", branch: "spike" }), { tail: "web · spike", tip: "web · spike" });
  assert.deepEqual(placeText({ name: "notes", repo: "web", branch: "spike", mode: "tooltip" }), { tail: "web", tip: "web · spike" });
  assert.deepEqual(placeText({ name: "fix-a", repo: "web", branch: "fix-a", tree: "├─" }), { tail: "", tip: null });
  assert.deepEqual(placeText({ name: "web", repo: "web", branch: null }), { tail: "detached", tip: "detached" });
});

test("attention counts who waits and cycles through them", async () => {
  const { attention } = await import("../mods/crest/crest.js");
  const list = [{ address: "a", status: "blocked" }, { address: "b", status: "working" }, { address: "c", status: "blocked" }, { address: "d", status: "done" }];
  const first = attention(list);
  assert.equal(first.blocked.count, 2);
  assert.equal(first.blocked.next.address, "a");
  assert.equal(first.done.next.address, "d");
  assert.equal(attention(list, { blocked: "a" }).blocked.next.address, "c");
  assert.equal(attention(list, { blocked: "c" }).blocked.next.address, "a", "wraps around");
  assert.equal(attention(list, { blocked: "gone" }).blocked.next.address, "a", "a closed agent starts over");
  assert.deepEqual(attention([]).blocked, { count: 0, next: null });
});

test("settleOpen: a space opened by hand goes back to auto-collapsing once it gets busy", async () => {
  const { settleOpen, toBlocks, memberKey } = await import("../mods/crest/crest.js");
  const quietRow = { w: { id: "q", status: "idle", folder: "/q", machine: null }, g: null };
  const busyRow = { w: { id: "b", status: "working", folder: "/b", machine: null }, g: null };
  const blocks = toBlocks([quietRow, busyRow]);
  assert.deepEqual(settleOpen([memberKey(quietRow), memberKey(busyRow), "gone"], blocks), [memberKey(quietRow), "gone"]);
});

test("subAgents: pane-less live children by parent; kept and ended ones stay out", async () => {
  const { subAgents, lineStatus, normalizeConfig } = await import("../mods/crest/crest.js");
  const terms = [
    { address: "t1" },
    { address: "t2", parent: "t1", state: "live", status: "working", name: "tests" },
    { address: "t3", parent: "t1", state: "live", status: "idle" },
    { address: "t4", parent: "t1", state: "live", status: "working" },
    { address: "t5", parent: "t1", state: "exited", status: "done" },
    { address: "t6", parent: "t9", state: "live" },
  ];
  const panes = [{ terminal: "t1" }, { terminal: "t4" }];
  assert.deepEqual(Object.fromEntries(Object.entries(subAgents(terms, panes)).map(([k, v]) => [k, v.map((x) => x.address)])), { t1: ["t2"], t9: ["t6"] });
  assert.deepEqual(subAgents(terms, panes, "all").t1.map((x) => x.address), ["t2", "t3"]);
  assert.deepEqual(subAgents(undefined, undefined), {});
  assert.equal(lineStatus("working"), "working");
  assert.equal(lineStatus("unknown"), null);
  assert.equal(normalizeConfig({ fetch: false }).fetch, false);
  assert.equal(normalizeConfig({}).fetch, true);
});

test("artFor: a scene by key, stable, moved on by shift; every scene has its file", async () => {
  const { artFor, ART, normalizeConfig } = await import("../mods/crest/crest.js");
  const { existsSync } = await import("node:fs");
  assert.equal(artFor("/u/notes"), artFor("/u/notes"));
  assert.notEqual(artFor("/u/notes"), artFor("/u/notes", 1));
  assert.equal(artFor("/u/notes", ART.length), artFor("/u/notes"), "a full turn comes back");
  assert.equal(artFor("/u/notes", -1), artFor("/u/notes", ART.length - 1), "negative shifts wrap");
  for (const name of ART) assert.ok(existsSync(new URL(`../mods/crest/art/${name}.svg`, import.meta.url)), name);
  assert.equal(normalizeConfig({ fill: "letter" }).fill, "letter");
  assert.equal(normalizeConfig({ fill: "emoji" }).fill, "art");
});
