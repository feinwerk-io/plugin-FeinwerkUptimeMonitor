/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { translate } from 'CoreHome';

/**
 * The two sides of an address while another plugin adds results checked from outside, in one place
 * for the uptime page's table, the narrow list, the widgets, the answer lines and the admin
 * overview (Peter, 2026-11-26, "1a, 2a, 3a").
 *
 * - Truth, as the API counts it: down when either side finds it down, else reachable when either
 *   reaches it, not checkable only when no side can check it; an outside that cannot check the
 *   address counts for nothing.
 * - 3a: only the Matomo server finds it down while the outside reaches it: the same truth (down),
 *   shown amber, "Not reachable from the Matomo server" (visitors still reach it). Down from
 *   outside stays red. L8 review of 5.3.0 and the review of its fixes: "reaches it" means an "up"
 *   newer than the start of the server's failure by more than the margin, with no outage seen from
 *   outside open or ended since the server's latest failing check (aloneDown). Limit: the latest
 *   result from outside is the newest the screen has (up to 2 h 15 min old between two deliveries),
 *   so an address the server alone already failed to reach that then goes down for everyone reads
 *   amber until a newer result from outside arrives.
 * - P2: a value shows once when both sides say the same (the same outcome, and for a failure the
 *   same words; two response times of a reachable address are the same answer); else two lines, the
 *   side that sets the dot first, each naming its side. An outside without a current result (none
 *   yet, an old one) adds no line.
 *
 * Follow-ups (Peter, 2026-11-26, "alle wie empfohlen"): D3 in the widgets a side that cannot check
 * the address adds no line (widgetSide); W5 an agreeing row's other value for screen readers
 * (aside); W8 the server's name never breaks inside (keepServer). UI review of 5.4.0, P3 (Peter,
 * "go"): the server's short reason it cannot check an address is shown with its words (sideWords)
 * but never compared, so the sides agree and split as before.
 */

/**
 * Review of the 5.3.0 fixes, SHOULD 2: how much newer (seconds) one side's result must be than the
 * start of the other side's failure to say anything about it, while the page has no value of the
 * server's (config.external.sidesMargin, Freshness::sidesMargin()): the default run budget (60 s,
 * the server stamps a run's results with its start) plus one probe minute of the outside.
 */
export const SIDES_MARGIN_SECONDS = 120;

/** one side of an address: its current outcome, its words and its uptime in the period */
export interface Side {
  key: 'server' | 'outside';
  /** up, down, not_checkable, stale (no current result), none (never checked) */
  outcome: string;
  /** a few words: "120 ms", "HTTP status 403", "Not checkable" (without a side) */
  text: string;
  /** its uptime in the period as shown ('' when not measured) */
  uptime: string;
  /** that uptime as a number (percent; null when not measured): a past day lists the lower first */
  percent?: number | null;
  /** a Tag Manager container too large to read: no side can read it, so its words never name one */
  tooLarge?: boolean;
  /**
   * UI review of 5.4.0, P3: the server's short reason it cannot check the address ("needs PHP
   * intl"), kept apart from text, which decides whether the sides agree; '' or undefined otherwise
   */
  reason?: string;
  /**
   * polish before 5.4.0: a line above names that reason, so the cell's words leave it out and its
   * tooltip keeps it. 'group': the answer line of the address's group names it for all of it (P1)
   * and names the Matomo server too, so one line says only "Not checkable"; 'screen' (quick UI
   * review before 5.4.0, L1): on a screen with results from outside another group's answer line
   * or the count line names it, so one line keeps "from the Matomo server" (other rows are checked
   * from outside) and a side line says "Not checkable"
   */
  reasonAbove?: '' | 'group' | 'screen';
  /** why the outside cannot check it (5.2.0 review B5) */
  title?: string;
  /** when its current result was checked (ISO time; '' without a current one) */
  checkedAt?: string;
  /**
   * the start of its current failure: its outage open for the address (ISO time; '' when none is
   * open, the failing result's checkedAt then stands for it)
   */
  downSince?: string;
  /**
   * an outage it saw is open for the address (also while its latest result reads up between two
   * failed minutes); undefined when the open outages could not be loaded, which counts as open
   */
  outageOpen?: boolean;
  /**
   * the end of the latest outage it saw for the address that has ended (ISO time; '' when none
   * ended since yesterday): review of the 5.3.0 fixes, SHOULD 1
   */
  outageEnd?: string;
  /**
   * seconds by which the other side's result must be newer than the start of this side's failure
   * to count (the server's config.external.sidesMargin; SIDES_MARGIN_SECONDS without it)
   */
  margin?: number;
}

/** one line of a value cell */
export interface Line {
  text: string;
  /** down (red), partial (3a, amber) or '' */
  tone: string;
  /** the other side's line: muted, under the first */
  other: boolean;
}

/** the outcomes in the order that decides an address's state from both sides */
const COMBINED = ['down', 'up', 'not_checkable', 'stale', 'none'];

/** outcomes that are a current answer of a side */
const SPEAKS = ['up', 'down', 'not_checkable'];

/** the outside has a current answer about the address (also that it cannot check it) */
export function speaks(side: Side | null | undefined): side is Side {
  return !!side && SPEAKS.includes(side.outcome);
}

/**
 * The address's state from both sides (truth, as getSitesOverview): an outside that cannot check it
 * counts for nothing.
 */
export function combined(server: string, outside: string | null | undefined): string {
  const counted = outside && outside !== 'not_checkable' ? outside : null;
  if (!counted) {
    return server;
  }
  return COMBINED.find((o) => o === server || o === counted) || server;
}

/**
 * L8 review of 5.3.0 (blocker) and the review of its fixes (SHOULD 1, 2): `failing` alone finds the
 * address down. The other side does not find it down and has no outage of its own open for it (an
 * outage from outside stays open until two good minutes in a row, so its latest "up" can lie inside
 * it; not known counts as open), nor one that ended at or after the failing side's latest failing
 * result (the failing side has not checked it since the other side's recovery). When the other
 * side reaches the address, its result is newer than the start of the failure (downSince, else the
 * failing result) by more than the failing side's margin: an older "up" says nothing about the
 * failure, and the server stamps a run's results with its start. An other side without a current
 * answer leaves it to the failing side. The same rule as getSitesOverview
 * (UptimeReport::aloneDown()).
 */
export function aloneDown(failing: Side, other: Side | null | undefined): boolean {
  if (failing.outcome !== 'down' || !other || other.outcome === 'down' || other.outageOpen !== false) {
    return false;
  }
  // an end that cannot be read counts as after the failing check
  if (other.outageEnd
    && !(Date.parse(other.outageEnd) < Date.parse(failing.checkedAt || ''))) {
    return false;
  }
  if (other.outcome !== 'up') {
    return true;
  }
  const since = Date.parse(failing.downSince || failing.checkedAt || '');
  const margin = typeof failing.margin === 'number' ? failing.margin : SIDES_MARGIN_SECONDS;
  return Date.parse(other.checkedAt || '') > since + margin * 1000;
}

/**
 * Quick UI review before 5.3.0, QL2: the side reaches the address while the other finds it down,
 * but its "up" does not count for the other side's one-sided failure (aloneDown: older than the
 * failure, or inside or right after an outage of its own): shown muted next to the red dot
 */
export function uncounted(side: Side, other: Side | null | undefined): boolean {
  return side.outcome === 'up' && !!other && other.outcome === 'down' && !aloneDown(other, side);
}

/**
 * 3a: only the Matomo server finds the address down while the outside reaches it (aloneDown: its
 * "up" after the failure began, no outage seen from outside open or ended since the server's
 * latest failing check)
 */
export function serverOnlyDown(server: Side, outside: Side | null | undefined): boolean {
  return server.key === 'server' && !!outside && outside.outcome === 'up'
    && aloneDown(server, outside);
}

/** the colour of the address's dot and row: its state, amber (partial) for 3a */
export function toneOf(server: Side, outside: Side | null | undefined): string {
  return serverOnlyDown(server, outside) ? 'partial'
    : combined(server.outcome, outside ? outside.outcome : null);
}

/**
 * both sides give the same answer: the same outcome, and for anything but reachable the same words
 */
function sameAnswer(server: Side, outside: Side): boolean {
  return server.outcome === outside.outcome && (server.outcome === 'up' || server.text === outside.text);
}

/**
 * The sides in the order the screens list them: the one that sets the address's state first (the
 * failing side of a one-sided failure, the reaching side when the other cannot check it), the
 * server on a tie.
 */
export function ordered(server: Side, outside: Side): Side[] {
  const state = combined(server.outcome, outside.outcome);
  return server.outcome === state || outside.outcome !== state
    ? [server, outside] : [outside, server];
}

/**
 * UI review W8: the server's name stays on one line ("Matomo server", "Matomo-Server", "serveur
 * Matomo"), in any case: its spaces no-break, its hyphen a non-breaking one
 */
export function keepServer(text: string): string {
  const name = translate('FeinwerkUptimeMonitor_UiSourceServer');
  if (!/[ -]/.test(name)) {
    return text;
  }
  const pattern = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return text.replace(pattern, (found) => found.replace(/ /g, '\u00a0').replace(/-/g, '\u2011'));
}

/** "HTTP status 403 from the Matomo server", "44 ms from outside" */
export function named(side: Side, text: string): string {
  return keepServer(translate(side.key === 'server' ? 'FeinwerkUptimeMonitor_UiValueFromServer'
    : 'FeinwerkUptimeMonitor_UiValueFromOutside', text));
}

/**
 * UI review of 5.4.0, P3: a side's words as a cell shows them, with the server's short reason it
 * cannot check the address ("Not checkable: needs PHP intl"); without it while the group's answer
 * line names it (polish before 5.4.0, reasonAbove)
 */
export function sideWords(side: Side): string {
  return side.reason && !side.reasonAbove
    ? translate('FeinwerkUptimeMonitor_UiNotCheckableCause', side.reason) : side.text;
}

/**
 * named() of a side's words: "Not checkable from the Matomo server: needs PHP intl"; without the
 * reason while a line above names it (reasonAbove)
 */
function namedWords(side: Side): string {
  return side.reason && side.key === 'server' && !side.reasonAbove
    ? keepServer(translate('FeinwerkUptimeMonitor_UiNotCheckableFromServerCause', side.reason))
    : named(side, side.text);
}

/**
 * Quick UI review before 5.4.0, L1: the server's words with its reason in one named line ("Not
 * checkable from the Matomo server: needs PHP intl"), the tooltip of a cell that leaves the reason
 * to a line above
 */
export function namedCause(side: Side): string {
  return namedWords({ ...side, reasonAbove: '' });
}

/** a failure in red; the server's while the outside reaches the address in amber (3a) */
function toneOfLine(side: Side, other: Side | null | undefined): string {
  if (side.outcome !== 'down') {
    return '';
  }
  return serverOnlyDown(side, other) ? 'partial' : 'down';
}

/**
 * A past day's order (UI review W1): the lower uptime first, which sets the day's amber dot; the
 * server on a tie or when a number is missing
 */
function lowerFirst(server: Side, outside: Side): Side[] {
  const a = server.percent;
  const b = outside.percent;
  return typeof a === 'number' && typeof b === 'number' && b < a ? [outside, server] : [server, outside];
}

/**
 * P2: the Response cell. One line when the outside has no current answer or both say the same; the
 * server's "Not checkable" then names the Matomo server (one name for it on a screen with results
 * from outside, review NIT 5), unless the outside cannot check it either or it is a container too
 * large for any server. Else both, ordered, each named. Polish before 5.4.0: "Not checkable" alone
 * while the group's answer line names the server and its reason (reasonAbove 'group'); "Not
 * checkable from the Matomo server" while the count line names the reason (L1, 'screen').
 */
export function responseLines(server: Side, outside: Side | null | undefined): Line[] {
  if (!speaks(outside) || sameAnswer(server, outside)) {
    const both = speaks(outside) && outside.outcome === 'not_checkable';
    const text = server.outcome === 'not_checkable' && !server.tooLarge && !both
      && server.reasonAbove !== 'group' ? namedWords(server) : sideWords(server);
    return [{ text, tone: toneOfLine(server, outside), other: false }];
  }
  return ordered(server, outside).map((side, i) => ({
    // a container too large for any server to read: its words never name a side (UI review W4)
    text: side.tooLarge ? side.text : namedWords(side),
    tone: toneOfLine(side, side.key === 'server' ? outside : server),
    other: i > 0,
  }));
}

/**
 * P2: the Uptime cell. One value when only the server has one or both are the same as shown; the
 * outside's alone names its side; two different ones both named, in the order of the sides (on a
 * past day the lower first). A past day says "Not measured" where nothing was.
 */
export function uptimeLines(server: Side, outside: Side | null | undefined, past: boolean): Line[] {
  const none = past ? translate('FeinwerkUptimeMonitor_UiNotMeasured') : '';
  if (!outside || outside.uptime === '' || outside.uptime === server.uptime) {
    return [{ text: server.uptime || none, tone: '', other: false }];
  }
  if (server.uptime === '') {
    return [{ text: named(outside, outside.uptime), tone: '', other: false }];
  }
  const sides = past ? lowerFirst(server, outside) : ordered(server, outside);
  return sides.map((side, i) => ({ text: named(side, side.uptime), tone: '', other: i > 0 }));
}

/**
 * P2 in the narrow list and the widgets: null when one line of values says it all (the cells above
 * would each be one line), else both sides in order, each on its own line under its name. byUptime:
 * the lower uptime first, as on a past day (UI review of 5.3.0, L4: the widgets on a past day,
 * which still show the current response).
 */
export function split(
  server: Side,
  outside: Side | null | undefined,
  past: boolean,
  byUptime = past,
): Side[] | null {
  if (!outside) {
    return null;
  }
  const response = !past && responseLines(server, outside).length > 1;
  if (!response && uptimeLines(server, outside, past).length < 2) {
    return null;
  }
  return byUptime ? lowerFirst(server, outside) : ordered(server, outside);
}

/**
 * the tone of one side's line in the narrow list (3a amber for the server's failure while the
 * outside reaches it)
 */
export function sideTone(side: Side, other: Side | null | undefined): string {
  return toneOfLine(side, other) || side.outcome;
}

/**
 * D3 (Peter, 2026-11-26, "alle wie empfohlen"): in the widgets a side that cannot check the address
 * adds no line, so a green widget stays one line per address. The side that can check it while the
 * other cannot (its values make the one line: the server's as without results from outside, the
 * outside's named); null when both or neither can, the page's rule then applies (split()).
 */
export function widgetSide(server: Side, outside: Side | null | undefined): Side | null {
  if (!speaks(outside)) {
    return null;
  }
  const serverCannot = server.outcome === 'not_checkable';
  const outsideCannot = outside.outcome === 'not_checkable';
  if (serverCannot === outsideCannot) {
    return null;
  }
  return serverCannot ? outside : server;
}

/**
 * W5 (UI review): a Response cell of one line while the outside answers too (the sides agree): what
 * the outside found, for screen readers ("Checked from outside: 118 ms"); '' otherwise. The eye
 * finds it in the cell's tooltip.
 */
export function aside(server: Side, outside: Side | null | undefined): string {
  if (!speaks(outside) || responseLines(server, outside).length > 1) {
    return '';
  }
  return translate('FeinwerkUptimeMonitor_UiCheckedFromOutsideValue', outside.text);
}
