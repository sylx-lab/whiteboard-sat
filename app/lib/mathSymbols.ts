/**
 * Contents of the visual math editor's symbol palette.
 *
 * Data only, so it can be checked: `mathSymbols.test.ts` renders every entry through
 * KaTeX, which catches a typo'd macro before it ships as an error box on a button.
 * Scoped to what the Digital SAT actually asks for — algebra, functions,
 * geometry/trig, and data analysis — rather than a general LaTeX dump.
 */
export interface MathSymbol {
  /** LaTeX spliced in at the caret. `{}` marks a slot the caret lands in. */
  insert: string;
  /** LaTeX rendered on the button face. Defaults to `insert` with slots filled. */
  display?: string;
  /** Plain label for symbols that do not render usefully at button size. */
  text?: string;
  title: string;
}

export interface SymbolGroup {
  id: string;
  label: string;
  symbols: MathSymbol[];
}

export const SYMBOL_GROUPS: SymbolGroup[] = [
  {
    id: 'structures',
    label: 'Structure',
    symbols: [
      { insert: '\\frac{}{}', display: '\\frac{a}{b}', title: 'Fraction' },
      { insert: '{}^{}', display: 'x^{a}', title: 'Superscript / power' },
      { insert: '{}_{}', display: 'x_{a}', title: 'Subscript' },
      { insert: '\\sqrt{}', display: '\\sqrt{x}', title: 'Square root' },
      { insert: '\\sqrt[]{}', display: '\\sqrt[n]{x}', title: 'nth root' },
      { insert: '\\left|{}\\right|', display: '|x|', title: 'Absolute value' },
      { insert: '\\overline{}', display: '\\overline{AB}', title: 'Overline / segment' },
      { insert: '\\left(\\right)', display: '(\;)', title: 'Parentheses' },
      { insert: '\\left[\\right]', display: '[\;]', title: 'Brackets' },
      { insert: '\\left\\{\\right\\}', display: '\\{\;\\}', title: 'Braces / set' },
      {
        insert: '\\begin{cases} {} \\\\ \\end{cases}',
        display: '\\begin{cases}a\\\\b\\end{cases}',
        title: 'Cases / piecewise',
      },
      {
        insert: '\\begin{bmatrix} {} & \\\\ & \\end{bmatrix}',
        display: '\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}',
        title: 'Matrix',
      },
    ],
  },
  {
    id: 'operators',
    label: 'Operators',
    symbols: [
      { insert: '\\times', title: 'Multiply' },
      { insert: '\\div', title: 'Divide' },
      { insert: '\\pm', title: 'Plus or minus' },
      { insert: '\\mp', title: 'Minus or plus' },
      { insert: '\\cdot', title: 'Dot product' },
      { insert: '=', title: 'Equals' },
      { insert: '\\neq', title: 'Not equal' },
      { insert: '\\approx', title: 'Approximately' },
      { insert: '<', display: '\\lt', title: 'Less than' },
      { insert: '>', display: '\\gt', title: 'Greater than' },
      { insert: '\\leq', title: 'Less than or equal' },
      { insert: '\\geq', title: 'Greater than or equal' },
      { insert: '\\propto', title: 'Proportional to' },
      { insert: '\\%', display: '\\%', title: 'Percent' },
      { insert: '^\\circ', display: '90^\\circ', title: 'Degrees' },
      { insert: '\\infty', title: 'Infinity' },
    ],
  },
  {
    id: 'greek',
    label: 'Greek',
    symbols: [
      { insert: '\\alpha', title: 'alpha' },
      { insert: '\\beta', title: 'beta' },
      { insert: '\\gamma', title: 'gamma' },
      { insert: '\\delta', title: 'delta' },
      { insert: '\\theta', title: 'theta' },
      { insert: '\\lambda', title: 'lambda' },
      { insert: '\\mu', title: 'mu' },
      { insert: '\\pi', title: 'pi' },
      { insert: '\\rho', title: 'rho' },
      { insert: '\\sigma', title: 'sigma' },
      { insert: '\\phi', title: 'phi' },
      { insert: '\\omega', title: 'omega' },
      { insert: '\\Delta', title: 'Delta / change' },
      { insert: '\\Sigma', title: 'Sigma' },
      { insert: '\\Omega', title: 'Omega' },
      { insert: '\\Theta', title: 'Theta' },
    ],
  },
  {
    id: 'functions',
    label: 'Functions',
    symbols: [
      { insert: '\\sin', title: 'sine' },
      { insert: '\\cos', title: 'cosine' },
      { insert: '\\tan', title: 'tangent' },
      { insert: '\\log', title: 'log' },
      { insert: '\\log_{}', display: '\\log_{b}', title: 'log base b' },
      { insert: '\\ln', title: 'natural log' },
      { insert: '\\sum_{}^{}', display: '\\sum_{i=1}^{n}', title: 'Summation' },
      { insert: '\\prod_{}^{}', display: '\\prod_{i=1}^{n}', title: 'Product' },
      { insert: '\\int_{}^{}', display: '\\int_{a}^{b}', title: 'Integral' },
      { insert: '\\lim_{{} \\to }', display: '\\lim_{x \\to 0}', title: 'Limit' },
      { insert: 'f({})', display: 'f(x)', title: 'Function notation' },
      { insert: '\\left|{}\\right|', display: '\\lvert x \\rvert', title: 'Magnitude' },
    ],
  },
  {
    id: 'geometry',
    label: 'Geometry',
    symbols: [
      { insert: '\\angle', title: 'Angle' },
      { insert: '\\triangle', title: 'Triangle' },
      { insert: '\\perp', title: 'Perpendicular' },
      { insert: '\\parallel', title: 'Parallel' },
      { insert: '\\cong', title: 'Congruent' },
      { insert: '\\sim', title: 'Similar' },
      { insert: '\\overrightarrow{}', display: '\\overrightarrow{AB}', title: 'Ray / vector' },
      { insert: '\\overgroup{}', display: '\\overgroup{AB}', title: 'Arc' },
      { insert: '\\overleftrightarrow{}', display: '\\overleftrightarrow{AB}', title: 'Line' },
      { insert: '\\pi r^{2}', display: '\\pi r^2', title: 'Area of a circle' },
      { insert: '^\\circ', display: '^\\circ', title: 'Degree symbol' },
    ],
  },
  {
    id: 'sets',
    label: 'Sets & logic',
    symbols: [
      { insert: '\\in', title: 'Element of' },
      { insert: '\\notin', title: 'Not an element of' },
      { insert: '\\subset', title: 'Subset' },
      { insert: '\\cup', title: 'Union' },
      { insert: '\\cap', title: 'Intersection' },
      { insert: '\\emptyset', title: 'Empty set' },
      { insert: '\\to', title: 'Maps to' },
      { insert: '\\Rightarrow', title: 'Implies' },
      { insert: '\\Leftrightarrow', title: 'If and only if' },
      { insert: '\\therefore', title: 'Therefore' },
      { insert: '\\ldots', display: '\\ldots', title: 'Ellipsis' },
      { insert: '\\overline{x}', display: '\\overline{x}', title: 'Mean' },
    ],
  },
];

