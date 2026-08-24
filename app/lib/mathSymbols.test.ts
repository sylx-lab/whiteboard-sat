/**
 * Run with: node --test app/lib/mathSymbols.test.ts
 *
 * Renders every palette entry through KaTeX with errors enabled. A typo'd macro
 * would otherwise ship silently as an error box on a button face, or produce
 * unrenderable question text once inserted.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import katex from 'katex';
import { SYMBOL_GROUPS } from './mathSymbols.ts';

const render = (latex: string) => katex.renderToString(latex, { throwOnError: true });

const allSymbols = SYMBOL_GROUPS.flatMap((g) => g.symbols.map((s) => ({ ...s, group: g.id })));

test('the palette is not empty and every group has symbols', () => {
  assert.ok(SYMBOL_GROUPS.length >= 5);
  for (const g of SYMBOL_GROUPS) {
    assert.ok(g.symbols.length > 0, `group ${g.id} is empty`);
  }
});

test('group ids are unique', () => {
  const ids = SYMBOL_GROUPS.map((g) => g.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every button face renders', () => {
  for (const sym of allSymbols) {
    if (sym.text) continue; // plain-text label, nothing to render
    const face = sym.display ?? sym.insert.replace(/\{\}/g, '{\\square}');
    assert.doesNotThrow(() => render(face), `${sym.group}/${sym.title}: face "${face}"`);
  }
});

test('every inserted snippet renders once its slots are filled', () => {
  for (const sym of allSymbols) {
    const filled = sym.insert.replace(/\{\}/g, '{x}').replace(/\[\]/g, '[3]');
    assert.doesNotThrow(() => render(filled), `${sym.group}/${sym.title}: filled "${filled}"`);
  }
});

test('every inserted snippet also renders with its slots left empty', () => {
  // Authors click a symbol and may save before filling every slot; that must still
  // render rather than showing a KaTeX error to a student.
  for (const sym of allSymbols) {
    assert.doesNotThrow(() => render(sym.insert), `${sym.group}/${sym.title}: raw "${sym.insert}"`);
  }
});

test('every symbol has a human title for its tooltip and aria-label', () => {
  for (const sym of allSymbols) {
    assert.ok(sym.title && sym.title.trim().length > 1, `missing title for ${sym.insert}`);
  }
});
