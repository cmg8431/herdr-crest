// crest: drawing. Every function returns a GPUI element and keeps no state.
import { div, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";

const ICON = (name) => `mods/workspace-chrome/${name}.svg`;

/** A status color that exists in every theme. */
export function statusColor(t, status) {
  return status === "blocked" ? (t.blocked ?? t.ansi1) : status === "done" ? (t.done ?? t.ansi2) : (t.working ?? t.accent);
}

/** The pulse that says "look here" (blocked) or "busy" (working). Done stays still. */
function pulse(el, status) {
  if (status === "blocked") return el.loop("opacity", { from: 0.35, to: 1, period: 900 });
  if (status === "working") return el.loop("opacity", { from: 0.3, to: 0.9, period: 1800 });
  return el;
}

/** The status dot that sits on a tile's corner, with a ring in the sidebar color so it reads on any picture. */
export function dot(t, status, size = 8) {
  return pulse(
    div().absolute().right(-2).bottom(-2).size(size).rounded(size / 2).bg(statusColor(t, status))
      .border(1.5).border_color(t.chrome ?? t.background),
    status,
  );
}

/**
 * A space's tile: its picture (rounded like the rest), else a letter on its color.
 * `faded`: a stand-in repo's tile; the picture dims, its status dot doesn't.
 * @param {{ t: any, size: number, radius: number, icon: string | null, letter: string, fill: string, status?: string | null, faded?: boolean }} o
 */
export function tile({ t, size, radius, icon, letter, fill, status, faded }) {
  // A picture: the project's, the owner's, or one of crest's own scenes (art/). Else the letter on its color.
  const face = icon
    ? h_flex().size(size).flex_none().rounded(radius).overflow_hidden().child(image(icon).size(size).rounded(radius))
    : h_flex().size(size).flex_none().rounded(radius).bg(fill).items_center().justify_center()
      .text_size(Math.round(size * 0.5)).font_bold().text_color("#ffffff").child(letter);
  return div().relative().size(size).flex_none()
    .child(faded ? div().opacity(0.6).child(face) : face)
    .when(Boolean(status), (el) => el.child(dot(t, status, size >= 22 ? 8 : 7)));
}

/** Small tiles in a row: who is inside a shut folder. */
export function stack(t, icons, more) {
  return h_flex().flex_none().gap(3).items_center()
    .children(icons.map((icon) => h_flex().size(15).flex_none().rounded(4).overflow_hidden().child(image(icon).size(15).rounded(4))))
    .when(more > 0, (el) => el.child(div().pl(1).text_size(10.5).text_color(t.dim).child(`+${more}`)));
}

/** A filled two-tone folder in the folder's color: the back sheet lighter, the front solid. Shut folders sit a little lower. */
export function folderGlyph(color, shut, size = 16) {
  return div().relative().size(size).flex_none()
    .child(svg("mods/crest/icons/folder-back.svg").size(size).absolute().left(0).top(0).text_color(color).opacity(0.5))
    .child(svg("mods/crest/icons/folder-front.svg").size(size).absolute().left(0).top(0).text_color(color).opacity(shut ? 0.75 : 1));
}

/**
 * A folder header: its name in the folder's color and how many spaces it holds.
 * Click folds it (Alt+click: only this one stays open). Drag it onto another header to reorder.
 * While a space is dragged, it is a drop target; while a folder is dragged, a line shows where it lands.
 */
export function folderHeader({ t, key, label, color, count, shut, status, icons, more, hot, landing, hovered, plain, onHover, onAdd, onClick, onMenu, onDown, onMove, onUp }) {
  // "plain": no raised bar, a quieter label; the rows under it carry the weight. The chevron shows
  // when it says something (shut) or on hover.
  const showChevron = !plain || shut || hovered;
  return v_flex().flex_none().mt(plain ? 10 : 8).relative()
    .child(h_flex().id(`crest-folder-${key}`).relative().h(plain ? 26 : 30).flex_none().pl(plain ? 8 : 10).pr(8).gap(plain ? 6 : 7).items_center().rounded(plain ? 7 : 8).cursor_pointer()
      .when(!plain, (el) => el.bg(hot ? t.selected : (t.surface ?? t.raised ?? t.hover)))
      .when(Boolean(plain && hot), (el) => el.bg(t.selected))
      .child(washLayer(t, `crest-fwash-${key}`, hovered && !hot, plain ? 7 : 8))
      .on_click(onClick)
      .on_mouse_down("left", onDown)
      .on_mouse_down("right", onMenu)
      .on_mouse_move(onMove)
      .on_mouse_up("left", onUp)
      .on_hover(onHover)
      .child(folderGlyph(color, shut, plain ? 14 : 16))
      .child(div().flex_shrink(1).min_w(0).truncate().font_medium().text_size(plain ? 11.5 : 12.5).text_color(plain ? t.muted : t.foreground).child(label))
      .child(div().flex_none().text_size(plain ? 10.5 : 11).text_color(t.dim).child(String(count)))
      .child(div().flex_1().min_w(4))
      .child(revealBox(`crest-faddbox-${key}`, hovered, 22, [iconButton({ t, id: `crest-fadd-${key}`, icon: "plus", tip: "Add spaces to this folder", onClick: onAdd })]))
      .when(shut && icons.length > 0 && !hovered, (el) => el.child(stack(t, icons, more)))
      .when(Boolean(status) && shut, (el) => el.child(pulse(div().size(7).flex_none().rounded(4).bg(statusColor(t, status)), status)))
      // In the same column as the rows' collapse chevrons.
      .child(h_flex().id(`crest-fchevbox-${key}`).w(SLOT).flex_none().justify_center().text_color(t.dim)
        .opacity(showChevron ? 1 : 0).transition("opacity", HOVER)
        .child(chevron(`crest-fchev-${key}`, !shut, 11))))
    .when(landing, (el) => el.child(div().absolute().left(4).right(4).top(-5).h(2).rounded(1).bg(t.accent)));
}

/** An empty folder of your own: a little room to drop into, no words. */
export function emptyHint(_t, name) {
  return div().id(`crest-empty-${name}`).h(10).flex_none();
}

/** A see-through wash of the text color: a hover that shows on any background, a hovered row's included. */
export function wash(t, alpha = "1f") {
  const c = String(t.foreground ?? "");
  return /^#[0-9a-f]{6}$/i.test(c) ? c + alpha : (t.selected ?? t.hover);
}

/**
 * What makes something a button inside a row: its own press (the row neither selects nor drags),
 * a hover you can see, and what it does: said at once in the row (`onHint`), else as a tooltip.
 */
export function control(el, { t, tip, onHint, onClick }) {
  return el.cursor_pointer()
    .hover((s) => s.bg(wash(t)).text_color(t.foreground))
    .active((s) => s.opacity(0.7))
    .when(Boolean(tip) && !onHint, (e) => e.tooltip(tip))
    .when(Boolean(onHint), (e) => e.on_hover((on, cx) => onHint(on ? tip : null, cx)))
    .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
    .on_mouse_up("left", (_e, cx) => cx.stop_propagation())
    .on_click((e, cx) => { cx.stop_propagation(); onClick(e, cx); });
}

// The one mark a PR chip may carry: failing checks, changes asked for, checks running, approved.
const PR_MARK = {
  fail: { icon: "x", color: (t) => t.blocked ?? t.ansi1 },
  changes: { icon: "square-pen", color: (t) => t.warning ?? t.ansi3 },
  pending: { icon: "clock", color: (t) => t.dim },
  approved: { icon: "check", color: (t) => t.done ?? t.ansi2 },
};

/** `#123` in the color of its state, with at most one small mark before it; click opens it. */
export function prChip(t, { id, pr, mark, tip, onHint, onClick }) {
  const color = pr.state === "merged" ? t.ansi5 : pr.state === "closed" ? t.ansi1 : pr.state === "draft" ? t.dim : t.ansi2;
  const m = mark ? PR_MARK[mark] : null;
  return control(h_flex().id(id).flex_none().h(20).px(3).gap(2).items_center().rounded(5).text_size(11).text_color(color)
    .when(Boolean(m), (el) => el.child(svg(ICON(m.icon)).size(10).flex_none().text_color(m.color(t))))
    .child(`#${pr.number}`), { t, tip, onHint, onClick });
}

// ---------------------------------------------------------------- motion
// All native (GPUI runs it, render doesn't): quick for hover so the list feels at hand, a spring for folding
// so a fold clicked again halfway turns back without a jolt. No overshoot anywhere: rows don't bounce.

/** Hover and small state changes. */
export const HOVER = { duration: 120, easing: "ease-out" };
/** Folding and collapsing. */
export const FOLD = { response: 240, damping: 1 };

/** The hover wash behind a row, fading in and out. Goes first among the row's children (it is drawn under them). */
export function washLayer(t, id, on, radius = 8) {
  return div().id(id).absolute().inset_0().rounded(radius).bg(t.hover).opacity(on ? 1 : 0).transition("opacity", HOVER);
}

/**
 * Buttons that slide open on hover: the box's width goes from 0 to theirs, so what's beside them glides aside.
 * Shut, it has no width, so nothing in it can be hit.
 */
export function revealBox(id, on, width, children) {
  return h_flex().id(id).flex_none().h(24).gap(2).items_center().overflow_hidden()
    .w(on ? width : 0).opacity(on ? 1 : 0)
    .transition("width", HOVER).transition("opacity", HOVER)
    .children(children);
}

/** A chevron that turns: right and down crossfade in place. Color comes from the parent. */
export function chevron(id, down, size = 11) {
  const face = (name, on) => div().id(`${id}-${name}`).absolute().left(0).top(0).size(size).opacity(on ? 1 : 0).transition("opacity", HOVER)
    .child(svg(ICON(`chevron-${name}`)).size(size));
  return div().relative().size(size).flex_none().child(face("right", !down)).child(face("down", down));
}

/**
 * A box whose height springs between `height` and 0 (`open`). What's inside is drawn either way and
 * clipped, so it folds instead of vanishing. `height` must be what the children add up to.
 */
export function slideBox(id, open, height, children) {
  return v_flex().id(id).flex_none().overflow_hidden().h(open ? height : 0).spring("height", FOLD).children(children);
}

/**
 * What a folder holds, one step in: a rail under the middle of the folder's glyph, its spaces to the right of it,
 * so they read as inside the folder. Slides shut with the folder.
 */
export function folderBody({ t, key, plain, open, height, children }) {
  const rail = plain ? 15 : 18; // the glyph's middle: header padding + half the glyph
  return slideBox(`crest-body-${key}`, open, height, [
    v_flex().flex_none().ml(rail - 1).pl(NEST_GAP).border_l(1.5).border_color(t.border).children(children),
  ]);
}

/** Space between a folder's rail and its rows. */
export const NEST_GAP = 2;

/** Width of the slot at the right end of every row and folder header, so their chevrons line up in one column. */
export const SLOT = 20;

/**
 * A space's collapse control, in the fixed slot at the right end of its row, so it never moves.
 * Collapsed: the worktree count and a right chevron, always shown, one target. Open: a down chevron on hover.
 * `show` false leaves the slot empty (nothing to collapse, or not hovered), still taking its width.
 */
export function disclosure({ t, id, shut, hidden, show, collapsible, onHint, onClick }) {
  // Nothing to fold: an empty slot, so columns still line up.
  if (!collapsible) return div().w(SLOT).h(24).flex_none();
  const tip = shut ? (hidden > 0 ? `Expand: ${hidden} worktree${hidden === 1 ? "" : "s"} inside` : "Expand") : "Collapse";
  // The count slides in as the space collapses; the chevron fades in on hover and turns as it folds.
  const countW = hidden > 0 ? 16 + 7 * String(hidden).length : 0;
  const el = h_flex().id(id).h(24).min_w(SLOT).flex_none().px(4).items_center().justify_end().rounded(6)
    .text_size(10.5).text_color(t.muted)
    .child(h_flex().id(`${id}-n`).flex_none().h(24).gap(3).items_center().overflow_hidden()
      .w(shut ? countW : 0).opacity(shut ? 1 : 0).transition("width", HOVER).transition("opacity", HOVER)
      .when(hidden > 0, (e) => e.child(svg(ICON("branch")).size(10).flex_none()).child(div().flex_none().child(String(hidden)))))
    .child(div().id(`${id}-c`).flex_none().opacity(show ? 1 : 0).transition("opacity", HOVER).child(chevron(`${id}-v`, !shut, 12)));
  return show ? control(el, { t, tip, onHint, onClick }) : el;
}

/**
 * At the top of the list: how many agents wait for you (blocked) or finished (done), as a dot and a number.
 * Click goes to the next one.
 */
export function attentionPill({ t, id, status, count, tip, onClick }) {
  return h_flex().id(id).h(18).flex_none().px(6).gap(4).items_center().rounded(9).cursor_pointer()
    .text_size(11).text_color(t.muted).tooltip(tip)
    .hover((s) => s.bg(t.hover).text_color(t.foreground))
    .on_click(onClick)
    .child(pulse(div().size(6).flex_none().rounded(3).bg(statusColor(t, status)), status === "blocked" ? "blocked" : null))
    .child(String(count));
}

/**
 * A git mark you can click (`↓n` pulls, the dirty dot shows Changes). Its own press, so the row
 * under it neither selects nor drags. Padded so a 5px dot is still easy to hit.
 */
export function gitAction(el, { t, id, tip, onHint, onClick }) {
  return control(el.id(id).flex_none().px(3).h(20).items_center().justify_center().rounded(5), { t, tip, onHint, onClick });
}

/** Uncommitted changes: a small dot; click shows them in the Changes panel. */
export function dirtyMark(t, { id, n, onHint, onClick }) {
  return gitAction(h_flex().min_w(14).child(div().size(5).rounded(3).bg(t.warning ?? t.ansi3)), { t, id, tip: `See ${n} uncommitted file${n === 1 ? "" : "s"}`, onHint, onClick });
}

/** What an agent is doing, the way the Agents list says it. */
export function agentStatus(t, status) {
  if (status === "working") return svg(ICON("spinner")).size(11).flex_none().text_color(t.working ?? t.accent).spin(900);
  if (status === "blocked") return pulse(div().size(7).mx(2).flex_none().rounded(4).bg(t.blocked ?? t.ansi1), "blocked");
  if (status === "done") return div().size(7).mx(2).flex_none().rounded(4).bg(t.done ?? t.ansi2);
  // Idle says nothing: no mark, and the line's text goes muted (see subLine).
  return div().size(7).mx(2).flex_none();
}

function programIcon(p, size, color) {
  if (!p?.icon) return null;
  return p.tint ? svg(p.icon).size(size).flex_none().text_color(color) : image(p.icon).w(size).h(size).flex_none();
}

/**
 * One line under a space: an agent (status, icon, what it's on, how long) or a running program.
 * The thin rail on the left ties it to the space above.
 */
/** Where a line's rail sits: under the tile (19), a worktree's branch mark (36), or an agent's status mark (its own + 19). */
export const RAIL = { space: 19, worktree: 36, step: 19 };

export function subLine({ t, id, program, text, age, status, last, indent = RAIL.space, pass = null, stub = false, hovered, armed, onHover, onClose, onClick }) {
  const pic = programIcon(program, 13, t.muted);
  // The rail sits under the middle of what it hangs from. `pass`: an outer rail that runs on past this line
  // (a sub-agent under an agent that isn't the last); `stub`: this line has sub-agents, so a rail drops from its mark.
  // pr: the row's padding plus its chevron slot, so ages line up with the git tails above.
  return h_flex().id(id).relative().h(24).flex_none().pl(indent).pr(8 + SLOT).items_center().rounded(6).cursor_pointer()
    .child(washLayer(t, `${id}-wash`, hovered, 6))
    .on_click(onClick)
    .when(pass !== null, (el) => el.child(div().absolute().left(pass).top(0).h(24).border_l(1.5).border_color(t.border)))
    .when(stub, (el) => el.child(div().absolute().left(indent + RAIL.step).top(17).h(7).border_l(1.5).border_color(t.border)))
    .child(div().w(10).h(24).flex_none().border_l(1.5).border_color(t.border).when(last, (el) => el.h(12).border_b(1.5).rounded_bl(5).mb(12)))
    .child(h_flex().w(18).flex_none().justify_center().items_center().child(status ? agentStatus(t, status) : svg(ICON("terminal")).size(11).text_color(t.dim)))
    .when(Boolean(pic), (el) => el.child(div().mr(6).child(pic)))
    .child(div().flex_1().min_w(0).truncate().text_size(12).text_color(status === "blocked" ? t.foreground : status === "idle" ? t.dim : t.muted).child(text))
    .on_hover(onHover)
    // On hover the age fades and × fades in over it, in place: nothing on the line moves.
    .when(Boolean(age), (el) => el.child(div().id(`${id}-age`).flex_none().pl(6).text_size(10.5).text_color(t.dim)
      .opacity((hovered || armed) && onClose ? 0 : 1).transition("opacity", HOVER).child(age)))
    .when(Boolean(onClose), (el) => el.child(h_flex().id(`${id}-xbox`).absolute().right(8 + SLOT - 4).top(0).h(24).items_center()
      .opacity(hovered || armed ? 1 : 0).transition("opacity", HOVER)
      .child(iconButton({ t, id: `${id}-x`, icon: "x", tip: armed ? "Click again to close" : "Close this terminal", danger: armed, onClick: onClose }))));
}

/** The space after the last folder: drop here to move a folder (or a space) to the very end. */
export function endZone({ t, landing, onMove, onUp }) {
  return div().id("crest-end").h(36).flex_none().relative()
    .on_mouse_move(onMove)
    .on_mouse_up("left", onUp)
    .when(landing, (el) => el.child(div().absolute().left(4).right(4).top(4).h(2).rounded(1).bg(t.accent)));
}

/** A small square button that shows on hover: an icon, a tooltip, no text. */
export function iconButton({ t, id, icon, tip, onClick, onHint, danger }) {
  // 22×24: big enough to hit in a 30px row; muted, not dim, so it reads before you aim.
  return control(h_flex().id(id).w(22).h(24).flex_none().rounded(6).items_center().justify_center()
    .text_color(danger ? (t.blocked ?? t.ansi1) : t.muted)
    .when(Boolean(danger), (el) => el.bg((t.blocked ?? "#ef4444") + "22"))
    .child(svg(icon.includes("/") ? icon : ICON(icon)).size(14)), { t, tip, onHint, onClick });
}

/** A folder in the narrow sidebar: its glyph, centered; the name on hover; a dot when shut and an agent there needs you. */
export function compactFolder({ t, key, label, color, shut, status, onClick, onMenu }) {
  return h_flex().id(`crest-cfolder-${key}`).h(26).w_full().flex_none().justify_center().items_center().rounded(7).relative()
    .tooltip(label)
    .hover((s) => s.bg(t.hover))
    .on_click(onClick)
    .on_mouse_down("right", onMenu)
    .child(folderGlyph(color, shut))
    .when(shut && Boolean(status), (el) => el.child(pulse(div().absolute().right(10).top(5).size(6).rounded(3).bg(statusColor(t, status)), status)));
}

/** A folder in the narrow sidebar: a rounded column holding its glyph and its spaces, so the group is visible. */
export function compactGroup(t, key, head, members) {
  return h_flex().id(`crest-cgroup-${key}`).mt(6).flex_none().justify_center()
    .child(v_flex().w(44).flex_none().py(3).gap(1).items_center().rounded(12).bg(t.surface ?? t.raised ?? t.hover)
      .child(head)
      .children(members));
}
