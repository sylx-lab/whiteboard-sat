import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The three modes are only real if every token is defined in every mode and the
 * result is still readable. Both are checked here rather than by eye, because a
 * token left out of one mode is invisible until someone switches to it.
 */
const css = readFileSync('app/globals.css', 'utf8');

const tokensIn = (selector: string): Record<string, string> => {
  const start = css.indexOf(selector);
  assert.notEqual(start, -1, `${selector} is missing from globals.css`);
  const body = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]]),
  );
};

const MODES = {
  white: tokensIn(':root {'),
  warm: tokensIn('body.mode-warm {'),
  dark: tokensIn('body.mode-dark {'),
};

const luminance = (hex: string) => {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

test('warm and dark define every colour token the default mode defines', () => {
  for (const [name, tokens] of Object.entries(MODES)) {
    if (name === 'white') continue;
    const missing = Object.keys(MODES.white).filter((token) => !(token in tokens));
    assert.deepEqual(missing, [], `${name} mode is missing ${missing.join(', ')}`);
  }
});

test('text stays readable in every mode (WCAG AA is 4.5:1)', () => {
  const pairs: [string, string][] = [
    ['--foreground', '--background'],
    ['--foreground', '--surface'],
    ['--foreground', '--surface-soft'],
    ['--foreground', '--brand-soft'],
    ['--foreground-secondary', '--surface'],
    ['--foreground-muted', '--surface'],
    ['--brand-text', '--surface'],
    ['--brand-text', '--brand-soft'],
  ];
  for (const [mode, tokens] of Object.entries(MODES)) {
    for (const [fg, bg] of pairs) {
      const ratio = contrast(tokens[fg], tokens[bg]);
      assert.ok(ratio >= 4.5, `${mode}: ${fg} on ${bg} is only ${ratio.toFixed(2)}:1`);
    }
  }
});

test('a white button label survives on the brand fill, and on the dark band', () => {
  for (const [mode, tokens] of Object.entries(MODES)) {
    // Button labels are bold 13-14px, so AA large (3:1) is the bar.
    assert.ok(
      contrast('#FFFFFF', tokens['--brand']) >= 3,
      `${mode}: white on --brand is ${contrast('#FFFFFF', tokens['--brand']).toFixed(2)}:1`,
    );
    assert.ok(contrast('#FFFFFF', tokens['--navy-section']) >= 7, `${mode}: white on --navy-section`);
  }
});

test('borders are visible against the surface they sit on', () => {
  for (const [mode, tokens] of Object.entries(MODES)) {
    const ratio = contrast(tokens['--border'], tokens['--surface']);
    assert.ok(ratio >= 1.15, `${mode}: --border is invisible on --surface (${ratio.toFixed(2)}:1)`);
  }
});

test('dark mode is actually dark, warm mode is actually warm', () => {
  assert.ok(luminance(MODES.dark['--background']) < 0.05, 'dark background is not dark');
  assert.ok(luminance(MODES.dark['--surface']) < luminance(MODES.dark['--surface-soft']),
    'dark surfaces should lift, not sink, as they stack');
  // Warm means the red channel leads the blue one — paper, not screen.
  const warm = MODES.warm['--background'];
  assert.ok(parseInt(warm.slice(1, 3), 16) > parseInt(warm.slice(5, 7), 16), 'warm background is not warm');
});

/**
 * Two deliberate exceptions, both about colours that must NOT follow the theme:
 * a scrim is a dark wash over the page in every mode, and the admin console is
 * light-only. Everything else in the student app has to come from a token.
 */
const ALLOWED_LITERAL_FILES = ['app/components/AppShell.tsx']; // its admin-only branch

test('the student app carries no hardcoded colours left to escape theming', () => {
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        // The admin console is deliberately light-only.
        if (entry.name === 'admin') continue;
        walk(path);
      } else if (entry.name.endsWith('.tsx') && !ALLOWED_LITERAL_FILES.includes(path)) {
        const source = readFileSync(path, 'utf8');
        // `text-white`, `bg-white/10` and `bg-slate-900/40` are allowed: overlays
        // and scrims sit on top of everything and stay themselves in every mode.
        // A *solid* slate fill is the thing that would not follow the theme.
        const found = source.match(/-\[#[0-9A-Fa-f]{6}\]|(?<![\w-])(?:bg|text|border)-slate-\d+(?![\w\-\/])/g);
        if (found) offenders.push(`${path}: ${[...new Set(found)].join(', ')}`);
      }
    }
  };
  walk('app');
  assert.deepEqual(offenders, [], `hardcoded colours:\n${offenders.join('\n')}`);
});
