import assert from 'node:assert/strict';
import test from 'node:test';
import { formatMathString } from './mathFormat.ts';

test('renders explicit single dollar math', () => {
  const result = formatMathString('$x^2 + 1$');
  assert.ok(result.includes('class="katex"'));
  assert.ok(result.includes('x'));
});

test('renders -x^10, -x^7, x^7, x^10 without dollars', () => {
  const r1 = formatMathString('-x^10');
  assert.ok(r1.includes('class="katex"'), '-x^10 should render katex');
  assert.ok(r1.includes('10'), '-x^10 should contain 10 in superscript');

  const r2 = formatMathString('-x^7');
  assert.ok(r2.includes('class="katex"'), '-x^7 should render katex');

  const r3 = formatMathString('x^7');
  assert.ok(r3.includes('class="katex"'), 'x^7 should render katex');

  const r4 = formatMathString('x^10');
  assert.ok(r4.includes('class="katex"'), 'x^10 should render katex');
});

test('renders negative and parenthesized exponents like x^-2 and 10^-5', () => {
  const r1 = formatMathString('x^-2');
  assert.ok(r1.includes('class="katex"'));

  const r2 = formatMathString('10^-5');
  assert.ok(r2.includes('class="katex"'));
});

test('renders parenthesized base and exponent like (x+1)^2 and 2^(n-1)', () => {
  const r1 = formatMathString('(x+1)^2');
  assert.ok(r1.includes('class="katex"'));

  const r2 = formatMathString('2^(n-1)');
  assert.ok(r2.includes('class="katex"'));
});

test('renders raw latex commands like \\frac{1}{2} without dollars', () => {
  const r = formatMathString('\\frac{1}{2}');
  assert.ok(r.includes('class="katex"'));
});

test('handles sentences with embedded caret math', () => {
  const r = formatMathString('Compare x^7 and -x^10 for x > 0.');
  assert.ok(r.includes('class="katex"'));
  assert.ok(r.includes('Compare'));
  assert.ok(r.includes('for x &gt; 0') || r.includes('for x > 0'));
});

test('preserves plain English text without caret or math', () => {
  const r = formatMathString('The correct answer is Option A because it satisfies the equation.');
  assert.ok(!r.includes('class="katex"'));
  assert.equal(r, 'The correct answer is Option A because it satisfies the equation.');
});

test('renders markdown bold and italic formatting', () => {
  const rBoldItalic = formatMathString('***bold italic***');
  assert.equal(rBoldItalic, '<strong><em>bold italic</em></strong>');

  const rQuotes = formatMathString('***"The author’s tone can best be described as cautiously optimistic,"***');
  assert.equal(rQuotes, '<strong><em>"The author’s tone can best be described as cautiously optimistic,"</em></strong>');

  const rBold = formatMathString('**important concept**');
  assert.equal(rBold, '<strong>important concept</strong>');

  const rItalic = formatMathString('*slightly different*');
  assert.equal(rItalic, '<em>slightly different</em>');

  const rUnderscores = formatMathString('___accented___ and __bolded__ and _emphasized_');
  assert.ok(rUnderscores.includes('<strong><em>accented</em></strong>'));
  assert.ok(rUnderscores.includes('<strong>bolded</strong>'));
  assert.ok(rUnderscores.includes('<em>emphasized</em>'));
});

test('renders standard LaTeX bracket delimiters \\[...\\] and \\(...\\)', () => {
  const rDisplay = formatMathString('\\[x^2 + y^2 = 1\\]');
  assert.ok(rDisplay.includes('class="katex"'));

  const rInline = formatMathString('\\(f(x) = 2x\\)');
  assert.ok(rInline.includes('class="katex"'));
});

test('renders unicode math symbols like ±, ≥, ≤, ²', () => {
  const rPlusMinus = formatMathString('x = ±5');
  assert.ok(rPlusMinus.includes('class="katex"'));

  const rInequality = formatMathString('x ≥ 10');
  assert.ok(rInequality.includes('class="katex"'));

  const rSuper = formatMathString('x² + y³ = 10');
  assert.ok(rSuper.includes('class="katex"'));
});

test('renders Phi(x) function notation and broad macros without dollars', () => {
  const rPhi = formatMathString('\\Phi(x) = 0.5');
  assert.ok(rPhi.includes('class="katex"'));
});

test('combines markdown bold/italic and math without collision', () => {
  const mixed = formatMathString('**Note:** The value of $x^2$ is always *non-negative*.');
  assert.ok(mixed.includes('<strong>Note:</strong>'));
  assert.ok(mixed.includes('<em>non-negative</em>'));
  assert.ok(mixed.includes('class="katex"'));
});

