import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Atom, BookOpen, Calculator, Check, ChevronDown, CircleHelp, Clock3, Command, Dices, Eraser, GraduationCap, Lightbulb, Moon, RotateCcw, Sparkles, Sun, X } from 'lucide-react';
import './style.css';

const OPS = [
  { id: 'union', label: 'Union', symbol: '∪', formula: 'A ∪ B', note: 'Every element that appears in A, in B, or in both.' },
  { id: 'intersection', label: 'Intersection', symbol: '∩', formula: 'A ∩ B', note: 'Only the elements shared by both sets.' },
  { id: 'a-b', label: 'Difference', symbol: '−', formula: 'A − B', note: 'Elements in A that do not appear in B.' },
  { id: 'b-a', label: 'Difference', symbol: '−', formula: 'B − A', note: 'Elements in B that do not appear in A.' },
  { id: 'complement', label: 'Complement', symbol: '′', formula: "A′", note: 'Elements in the universal set U that are not in A.' },
  { id: 'product', label: 'Cartesian product', symbol: '×', formula: 'A × B', note: 'All ordered pairs with a first element from A and a second from B.' },
  { id: 'power', label: 'Power set', symbol: '𝒫', formula: '𝒫(A)', note: 'The set of every possible subset of A, including ∅ and A.' },
];
const unique = (xs) => [...new Set(xs)];
function parse(value) { return unique(value.split(/[ ,;\n]+/).map(x => x.trim()).filter(Boolean)); }
function setText(xs) { return `{ ${xs.length ? xs.join(', ') : '∅'} }`; }
function calculate(op, a, b, u) {
  switch (op) {
    case 'union': return unique([...a, ...b]);
    case 'intersection': return a.filter(x => b.includes(x));
    case 'a-b': return a.filter(x => !b.includes(x));
    case 'b-a': return b.filter(x => !a.includes(x));
    case 'complement': return u.filter(x => !a.includes(x));
    case 'product': return a.flatMap(x => b.map(y => `(${x}, ${y})`));
    case 'power': return a.reduce((out, x) => [...out, ...out.map(s => [...s, x])], [[]]).map(setText);
    default: return [];
  }
}
const examples = [
  { title: 'The common ground', tag: 'INTERSECTION', a: '1, 2, 3, 4', b: '3, 4, 5, 6', op: 'intersection' },
  { title: 'Everything together', tag: 'UNION', a: 'apple, banana', b: 'banana, cherry', op: 'union' },
  { title: 'A’s leftovers', tag: 'DIFFERENCE', a: 'a, b, c, d', b: 'c, d, e', op: 'a-b' },
  { title: 'Outside of A', tag: 'COMPLEMENT', a: '1, 2', b: '3, 4, 5', u: '1, 2, 3, 4, 5', op: 'complement' },
  { title: 'Pair them up', tag: 'CARTESIAN PRODUCT', a: 'x, y', b: '1, 2', op: 'product' },
  { title: 'Every possibility', tag: 'POWER SET', a: 'a, b', b: '', op: 'power' },
];

function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('ready-set-go-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    catch { return 'light'; }
  });
  const [aInput, setA] = useState('1, 2, 3, 4');
  const [bInput, setB] = useState('3, 4, 5, 6');
  const [uInput, setU] = useState('1, 2, 3, 4, 5, 6, 7');
  const [op, setOp] = useState('intersection');
  const [activeTab, setTab] = useState('studio');
  const [showGuide, setGuide] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const A = useMemo(() => parse(aInput), [aInput]);
  const B = useMemo(() => parse(bInput), [bInput]);
  const U = useMemo(() => parse(uInput), [uInput]);
  const selected = OPS.find(item => item.id === op);
  const needsB = !['power', 'complement'].includes(op);
  const needsU = op === 'complement';
  const result = useMemo(() => calculate(op, A, B, U), [op, A, B, U]);
  const missingFromU = A.some(x => !U.includes(x));
  const relationships = { subset: A.every(x => B.includes(x)), reverse: B.every(x => A.includes(x)), equal: A.length === B.length && A.every(x => B.includes(x)), disjoint: !A.some(x => B.includes(x)) };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('ready-set-go-theme', theme); } catch { /* Theme still works for this session. */ }
  }, [theme]);

  function loadExample(example) { setA(example.a); setB(example.b); setU(example.u || '1, 2, 3, 4, 5, 6, 7'); setOp(example.op); setTab('studio'); }
  function newQuiz() {
    const ex = examples[Math.floor(Math.random() * examples.length)];
    const correct = setText(calculate(ex.op, parse(ex.a), parse(ex.b), parse(ex.u || '')));
    const distractors = examples.filter(item => item.op !== ex.op)
      .map(item => setText(calculate(item.op, parse(item.a), parse(item.b), parse(item.u || ''))))
      .filter(value => value !== correct);
    const options = unique([correct, ...distractors]).slice(0, 4).sort(() => Math.random() - 0.5);
    setQuiz({ ...ex, correct, options }); setSelectedChoice(''); setFeedback('');
  }
  function checkAnswer() {
    if (!quiz) return;
    if (!selectedChoice) { setFeedback('Choose an answer first.'); return; }
    const correct = selectedChoice === quiz.correct;
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? 'That’s right! You’ve got it.' : `Not quite. The answer is ${quiz.correct}.`);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#home"><span className="brand-mark"><Atom size={21}/></span><span>ready set <b>go.</b></span></a>
      <div className="side-caption">YOUR WORKSPACE</div>
      <nav className="side-nav">
        <button className={activeTab === 'studio' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('studio')}><Calculator size={17}/> Set studio</button>
        <button className={activeTab === 'lesson' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('lesson')}><GraduationCap size={17}/> Lesson 1</button>
        <button className={activeTab === 'examples' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('examples')}><BookOpen size={17}/> Examples</button>
        <button className={activeTab === 'practice' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('practice')}><Dices size={17}/> Practice</button>
      </nav>
      <div className="side-caption tools-caption">QUICK TOOLS</div>
      <button className="nav-item quiet" onClick={() => setGuide(true)}><CircleHelp size={17}/> Formula guide</button>
      <div className="sidebar-bottom"><div className="mini-quote"><span>✳</span><p>Good things happen<br/>when sets come together.</p></div><div className="version">SET THEORY, MADE FRIENDLY <span>✦</span></div></div>
    </aside>

    <main className="main-content" id="home">
      <header className="topbar"><div className="breadcrumb">LEARN <span>/</span> SET THEORY</div><div className="topbar-actions"><button className="theme-toggle" onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}<span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button><button className="help-button" onClick={() => setGuide(true)}><CircleHelp size={17}/> <span>Need a hand?</span></button></div></header>
      {activeTab === 'studio' && <>
        <section className="hero"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR SET THEORY PLAYGROUND</div><h1>Ready, set, <em>go.</em></h1><p>Explore how sets work. Pick your elements, choose an operation,<br className="desktop-break"/> and see the math come to life.</p></div><div className="hero-art" aria-hidden="true"><div className="art-sun">✳</div><div className="art-a">A</div><div className="art-b">B</div><span className="art-dot d1"/><span className="art-dot d2"/><span className="art-dot d3"/><span className="art-dot d4"/><span className="art-orbit">A ∪ B</span></div></section>

        <div className="workspace-grid">
          <div className="workspace-column workspace-left">
            <section className="card calculator-card">
            <div className="card-heading"><div><div className="section-kicker">01 <span>·</span> SETUP</div><h2>Build your sets</h2></div><button className="reset-button" onClick={() => {setA('');setB('');setU('');setOp('union');}}><RotateCcw size={14}/> Reset</button></div>
            <div className="set-inputs"><label className="set-field"><span className="set-label"><i className="set-dot dot-a"/> SET A <b className="field-required">REQUIRED</b></span><input value={aInput} onChange={e => setA(e.target.value)} placeholder="Enter values, e.g. 1, 2, 3"/><span className="field-hint">Separate each element with a comma</span><span className="set-preview">A = {setText(A)} <b>|A| = {A.length}</b></span></label><label className={`set-field ${!needsB ? 'field-disabled' : ''}`}><span className="set-label"><i className="set-dot dot-b"/> SET B <b className={needsB ? 'field-required' : 'field-not-used'}>{needsB ? 'REQUIRED' : 'NOT USED'}</b></span><input disabled={!needsB} value={bInput} onChange={e => setB(e.target.value)} placeholder={needsB ? 'Enter values, e.g. 3, 4, 5' : `Not needed for ${selected.label.toLowerCase()}`}/>{needsB ? <><span className="field-hint">Separate each element with a comma</span><span className="set-preview">B = {setText(B)} <b>|B| = {B.length}</b></span></> : <span className="field-hint">This operation only uses Set A</span>}</label></div>
            <label className={`universal-field ${!needsU ? 'field-disabled' : ''}`}><span><span className="u-symbol">U</span> UNIVERSAL SET <b className={needsU ? 'field-required' : 'field-not-used'}>{needsU ? 'REQUIRED' : 'NOT USED'}</b></span><input disabled={!needsU} value={uInput} onChange={e => setU(e.target.value)} placeholder={needsU ? 'Enter universal set, e.g. 1, 2, 3, 4, 5' : 'Only needed to calculate a complement'}/>{needsU && <small className="field-hint">Include all possible elements, including the elements in A</small>}</label>
            <div className="operation-heading"><div className="section-kicker">02 <span>·</span> OPERATION</div><span className="subtle">Choose what to explore</span></div>
            <div className="operation-grid">{OPS.map(item => <button key={item.id} className={`operation-chip ${op === item.id ? 'selected' : ''}`} onClick={() => setOp(item.id)}><span>{item.symbol}</span><small>{item.id === 'a-b' ? 'A − B' : item.id === 'b-a' ? 'B − A' : item.label}</small></button>)}</div>
            <div className="calc-footer"><span><Sparkles size={15}/> Updates as you type</span><button className="clear-button" onClick={() => {setA('');setB('');setU('');}}><Eraser size={14}/> Clear inputs</button></div>
          </section>
            <section className="card relationship-card"><div className="card-heading"><div><div className="section-kicker">SET CHECK</div><h2>How are they related?</h2></div><span className="check-icon"><Check size={16}/></span></div><div className="relationship-list"><Relation yes={relationships.subset} text="A is a subset of B" math="A ⊆ B"/><Relation yes={relationships.reverse} text="B is a subset of A" math="B ⊆ A"/><Relation yes={relationships.equal} text="A and B are equal" math="A = B"/><Relation yes={relationships.disjoint} text="A and B are disjoint" math="A ∩ B = ∅"/></div><div className="relation-note">Relationships update when you edit your sets.</div></section>
          </div>
          <div className="workspace-column workspace-right">
            <section className="card venn-card"><div className="card-heading"><div><div className="section-kicker">VISUALIZE</div><h2>{op === 'product' ? 'Pair every element' : op === 'power' ? 'Explore every subset' : 'See how they overlap'}</h2></div><span className="venn-tag">{selected.formula}</span></div>{op === 'product' ? <ProductMatrix a={A} b={B}/> : op === 'power' ? <PowerSetList subsets={result}/> : <><Venn operation={op} a={A} b={B}/><div className="venn-legend"><span><i className="legend-a"/> Set A</span><span><i className="legend-b"/> Set B</span><span><i className="legend-overlap"/> {op === 'intersection' ? 'Shared' : 'Selected'}</span></div></>}</section>
            <section className="card result-card"><div className="card-heading result-head"><div><div className="section-kicker">03 <span>·</span> YOUR RESULT</div><h2>Let’s see what we get</h2></div><span className="live-pill"><i/> LIVE</span></div>
            <div className="result-paper"><div className="result-label">{selected.formula}</div><div className="result-value">{result.length > 9 ? `${result.slice(0, 9).join(', ')} …` : result.length ? result.join(', ') : '∅'}</div><div className="result-set">{setText(result)}</div><div className="result-count">CARDINALITY <b>|result| = {result.length}</b></div></div>
            <div className="explanation"><div className="bulb"><Lightbulb size={17}/></div><div><b>The idea</b><p>{selected.note} {op === 'intersection' ? `Here, ${setText(result)} is in both A and B.` : `For these sets, the result is ${setText(result)}.`}</p></div></div>
            {op === 'complement' && missingFromU && <div className="inline-warning">Some elements in A are outside U. Add them to U for a complete complement.</div>}

          </section>
          </div>
        </div>

        <footer className="page-footer"><span>READY SET GO <b>✳</b> A LITTLE MORE CLARITY, ONE SET AT A TIME.</span><span>BUILT FOR CURIOUS MINDS</span></footer>
      </>}
      {activeTab === 'examples' && <section className="page-section"><div className="eyebrow"><span className="eyebrow-dot"/> PICK ONE AND EXPLORE</div><h1>Examples to <em>try.</em></h1><p className="page-intro">A few friendly starting points. Open one in the studio and change the sets to see what happens.</p><div className="examples-grid">{examples.map(ex => <button className="example-card" key={ex.title} onClick={() => loadExample(ex)}><span className="example-tag">{ex.tag}</span><h3>{ex.title}</h3><p>A = {setText(parse(ex.a))}</p>{ex.b && <p>B = {setText(parse(ex.b))}</p>}<span className="try-link">Explore in studio <ArrowRight size={15}/></span></button>)}</div></section>}
      {activeTab === 'lesson' && <LessonPage onOpenStudio={() => setTab('studio')}/> }
      {activeTab === 'practice' && <section className="page-section practice-section"><div className="eyebrow"><span className="eyebrow-dot"/> A LITTLE PRACTICE</div><h1>Make it <em>stick.</em></h1><p className="page-intro">Try a set problem and choose the correct answer.</p><div className="card quiz-card"><div className="quiz-top"><span className="section-kicker">PRACTICE ROUND</span><span className="score-badge">✦ Score: {score}</span></div>{quiz ? <><div className="quiz-question"><span className="quiz-op">{OPS.find(x => x.id === quiz.op)?.formula}</span><h2>{OPS.find(x => x.id === quiz.op)?.label}</h2><p>A = {setText(parse(quiz.a))}{quiz.b && <> <span>·</span> B = {setText(parse(quiz.b))}</>}{quiz.u && <> <span>·</span> U = {setText(parse(quiz.u))}</>}</p></div><div className="choice-label">CHOOSE THE CORRECT SET</div><div className="quiz-options">{quiz.options.map((option, index) => <button key={`${option}-${index}`} className={`quiz-option ${selectedChoice === option ? 'chosen' : ''} ${feedback && option === quiz.correct ? 'answer-correct' : ''}`} onClick={() => { if (!feedback || feedback === 'Choose an answer first.') { setSelectedChoice(option); setFeedback(''); } }}><span className="choice-letter">{String.fromCharCode(65 + index)}</span><code>{option}</code></button>)}</div>{feedback && <div className={`quiz-feedback ${feedback.startsWith('Not') ? 'incorrect' : ''}`}>{feedback}</div>}<div className="quiz-buttons"><button className="secondary-button" onClick={newQuiz}>New question <RotateCcw size={14}/></button><button className="primary-button" onClick={checkAnswer}>Check answer <ArrowRight size={15}/></button></div></> : <div className="quiz-empty"><div className="quiz-icon"><Dices size={23}/></div><h2>Ready when you are.</h2><p>Generate a question and see what you know.</p><button className="primary-button" onClick={newQuiz}>Get a question <ArrowRight size={15}/></button></div>}</div></section>}
      {showGuide && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setGuide(false)}><div className="guide-modal"><button className="modal-close" onClick={() => setGuide(false)}><X size={18}/></button><div className="eyebrow"><span className="eyebrow-dot"/> QUICK REFERENCE</div><h2>A tiny set theory guide</h2><p className="guide-intro">A set is a collection of distinct elements. Order does not matter, and duplicates count once.</p><div className="guide-list">{OPS.map(item => <div className="guide-row" key={item.id}><span className="guide-symbol">{item.formula}</span><span><b>{item.label}</b><small>{item.note}</small></span></div>)}<div className="guide-row"><span className="guide-symbol">|A|</span><span><b>Cardinality</b><small>The number of distinct elements in A.</small></span></div></div><button className="primary-button guide-done" onClick={() => setGuide(false)}>Got it <Check size={15}/></button></div></div>}
    </main>
  </div>;
}

function LessonPage({onOpenStudio}) {
  const contents = [
    ['overview', 'The big picture'], ['sets', 'Sets and notation'], ['operations', 'Set operations'],
    ['relations', 'Relations'], ['functions', 'Functions'], ['logic', 'Logic and quantifiers'],
    ['proofs', 'Proof techniques'], ['induction', 'Induction'],
  ];
  return <section className="page-section lesson-page">
    <div className="lesson-hero"><div><div className="eyebrow"><span className="eyebrow-dot"/> AUTOMATA AND LANGUAGE THEORY · MODULE 1</div><h1>Mathematical <em>foundations.</em></h1><p className="page-intro">The core ideas behind sets, relationships, functions, logic, and proof. A guided read to help you see how the pieces fit together.</p><div className="lesson-meta"><span>LESSON 1</span><i/> 8 MIN READ <i/> FOUNDATIONS</div></div><div className="lesson-hero-mark">∑</div></div>
    <div className="lesson-layout"><aside className="lesson-toc"><span className="section-kicker">IN THIS LESSON</span>{contents.map(([id, label], i) => <a href={`#${id}`} key={id}><span>{String(i + 1).padStart(2, '0')}</span>{label}</a>)}<button onClick={onOpenStudio}>Open set studio <ArrowRight size={14}/></button></aside>
      <article className="lesson-article">
        <section id="overview" className="lesson-block"><div className="lesson-kicker">START HERE</div><h2>Why mathematical foundations matter</h2><p>Automata and Language Theory studies abstract machines and the formal languages they recognize or generate. It uses mathematical models to describe how machines process strings of symbols, and to ask what problems computation can solve.</p><p>Sets, relations, functions, and logic give us a precise way to describe those models. The states of a machine, its input alphabet, and the language it accepts are all sets. These foundations also support compiler design, programming languages, artificial intelligence, natural language processing, and computer security.</p><div className="lesson-callout"><Lightbulb size={18}/><p><b>By the end, you should be able to</b><br/>Use set notation and operations, describe relations and functions, read logical statements, and explain how proof and induction establish mathematical claims.</p></div></section>
        <section id="sets" className="lesson-block"><div className="lesson-kicker">01 · SETS</div><h2>A set is a collection of distinct things</h2><p>A <b>set</b> is a well-defined collection of distinct objects, called elements or members. For example, the vowels form the set {`{A, E, I, O, U}`}, and the first few even numbers form {`{2, 4, 6, 8}`}. Sets are written inside curly braces.</p><div className="notation-grid"><div><code>∈</code><b>Belongs to</b><p>2 ∈ {`{1, 2, 3}`} means 2 is an element of the set.</p></div><div><code>∉</code><b>Does not belong</b><p>5 ∉ {`{1, 2, 3}`} means 5 is not an element.</p></div><div><code>∅</code><b>Empty set</b><p>A set with no elements.</p></div><div><code>|A|</code><b>Cardinality</b><p>The number of distinct elements in A.</p></div></div><p>If A = {`{1, 2, 3}`}, then |A| = 3. A set ignores repeated entries: {`{1, 1, 2}`} and {`{1, 2}`} describe the same set.</p></section>
        <section id="operations" className="lesson-block"><div className="lesson-kicker">02 · SET OPERATIONS</div><h2>Combine sets and compare them</h2><p>Operations make it possible to build new sets from existing ones. Suppose A = {`{A, B, C, L, M}`} and B = {`{X, Y, Z, L, M}`}.</p><div className="operation-notes"><div><span>A ∪ B</span><b>Union</b><p>Everything in A or B (or both): {`{A, B, C, L, M, X, Y, Z}`}.</p></div><div><span>A ∩ B</span><b>Intersection</b><p>Only shared elements: {`{L, M}`}.</p></div><div><span>A − B</span><b>Difference</b><p>In A, but not B: {`{A, B, C}`}.</p></div><div><span>A′</span><b>Complement</b><p>Elements in universal set U that are outside A. The answer depends on U.</p></div><div><span>A × B</span><b>Cartesian product</b><p>Ordered pairs (a, b) with a from A and b from B.</p></div><div><span>𝒫(A)</span><b>Power set</b><p>Every possible subset of A, including ∅ and A itself.</p></div></div><button className="inline-studio-link" onClick={onOpenStudio}>Try these operations in Set studio <ArrowRight size={15}/></button></section>
        <section id="relations" className="lesson-block"><div className="lesson-kicker">03 · RELATIONS</div><h2>Relations describe connections</h2><p>A relation from one set to another is a subset of their Cartesian product. It tells us which elements are connected. Unlike a function, a relation does not require every element to have exactly one corresponding value. Relations are used in databases, graph theory, network models, and automata transition systems.</p><div className="property-list"><div><code>Reflexive</code><p>Every element is related to itself: (a, a) ∈ R for each a ∈ A.</p></div><div><code>Symmetric</code><p>If a is related to b, then b is related to a.</p></div><div><code>Antisymmetric</code><p>If a is related to b and b to a, then a = b.</p></div><div><code>Transitive</code><p>If a is related to b and b to c, then a is related to c.</p></div></div><p>A relation that is reflexive, symmetric, and transitive is an <b>equivalence relation</b>. It groups elements into equivalence classes.</p><div className="lesson-example"><b>Example · grouping by remainder</b><p>When integers are grouped by their remainder after division by 3, they fall into three classes: remainder 0, remainder 1, and remainder 2. Numbers in the same class are equivalent under this rule.</p></div></section>
        <section id="functions" className="lesson-block"><div className="lesson-kicker">04 · FUNCTIONS</div><h2>A function gives each input one output</h2><p>A function f: A → B is a relation where every element of A is associated with exactly one element of B. A is the <b>domain</b>, B is the <b>codomain</b>, and f(a) is the image of a.</p><div className="function-grid"><div><b>Injective — one-to-one</b><p>Different inputs always map to different outputs.</p></div><div><b>Surjective — onto</b><p>Every element of the codomain is used by at least one input.</p></div><div><b>Bijective</b><p>Both injective and surjective: each output is used exactly once.</p></div><div><b>Partial function</b><p>Some domain elements may have no corresponding output.</p></div></div></section>
        <section id="logic" className="lesson-block"><div className="lesson-kicker">05 · LOGIC</div><h2>Logic makes reasoning precise</h2><p>A proposition is a statement that is either true or false. Compound propositions combine simpler statements using logical connectives.</p><div className="logic-table"><div><code>¬p</code><b>Negation</b><span>not p</span></div><div><code>p ∧ q</code><b>Conjunction</b><span>p and q</span></div><div><code>p ∨ q</code><b>Disjunction</b><span>p or q</span></div><div><code>p → q</code><b>Implication</b><span>if p, then q</span></div><div><code>p ↔ q</code><b>Biconditional</b><span>p if and only if q</span></div></div><p><b>Quantifiers</b> describe how many elements satisfy a condition. ∀ means “for all,” while ∃ means “there exists.” For example, ∀x ∈ ℕ, x + 0 = x.</p></section>
        <section id="proofs" className="lesson-block"><div className="lesson-kicker">06 · PROOF</div><h2>Proofs show why a claim always holds</h2><p>A proof is a logical argument built from definitions, accepted facts, and established results. Examples can help us discover patterns, but a proof justifies a statement for every case covered by its conditions.</p><div className="proof-list"><p><b>Direct proof</b> — Start with the hypothesis and use logical steps to reach the conclusion.</p><p><b>Contraposition</b> — To prove “if p then q,” show instead that “if not q then not p.”</p><p><b>Contradiction</b> — Assume the claim is false and show that this leads to an impossibility.</p><p><b>Cases</b> — Split the possibilities into exhaustive cases and prove the claim in each one.</p></div></section>
        <section id="induction" className="lesson-block"><div className="lesson-kicker">07 · INDUCTION</div><h2>Induction builds a chain of true statements</h2><p>Mathematical induction proves that a statement P(n) holds for every natural number in a specified range. It works like dominoes: establish the first case, then show each case leads to the next.</p><div className="induction-steps"><div><span>1</span><b>Base case</b><p>Show the claim holds at the starting value, often n = 0 or n = 1.</p></div><div><span>2</span><b>Inductive step</b><p>Assume it holds for n = k, then prove it holds for n = k + 1.</p></div></div><div className="lesson-example"><b>Example · sum of the first n integers</b><p>1 + 2 + … + n = n(n + 1)/2. Check the starting case, then assume the formula for k and show adding k + 1 gives (k + 1)(k + 2)/2.</p></div><p><b>Structural induction</b> applies the same idea to recursively built objects such as strings, trees, or grammars.</p></section>
        <section className="lesson-block lesson-conclusion"><div className="lesson-kicker">TAKE THIS WITH YOU</div><h2>One mathematical toolkit, many applications</h2><p>Sets describe collections, relations and functions describe connections, logic makes statements precise, and proofs establish why claims are true. Together, these ideas provide a framework for studying automata, formal languages, and computation.</p><button className="primary-button" onClick={onOpenStudio}>Continue to Set studio <ArrowRight size={15}/></button></section>
      </article></div>
  </section>;
}

function Relation({yes, text, math}) { return <div className="relation-row"><span className={`relation-indicator ${yes ? 'yes' : ''}`}>{yes ? <Check size={12}/> : <X size={12}/>}</span><span>{text}</span><code>{math}</code></div>; }

function ProductMatrix({a, b}) {
  if (!a.length || !b.length) return <div className="visual-empty">Add elements to both A and B to build the pair matrix.</div>;
  return <div className="matrix-wrap"><table className="product-matrix"><thead><tr><th>A × B</th>{b.map((y, i) => <th key={`${y}-${i}`}>{y}</th>)}</tr></thead><tbody>{a.map((x, i) => <tr key={`${x}-${i}`}><th>{x}</th>{b.map((y, j) => <td key={`${x}-${y}-${j}`}>({x}, {y})</td>)}</tr>)}</tbody></table></div>;
}

function PowerSetList({subsets}) {
  return <div className="power-list-wrap"><div className="power-list-meta">{subsets.length} SUBSETS <span>Each row is one member of 𝒫(A)</span></div><div className="power-list">{subsets.map((subset, index) => <div className="power-list-item" key={`${subset}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><code>{subset}</code></div>)}</div></div>;
}

function Venn({operation, a, b}) {
  const markA = ['union','a-b','complement'].includes(operation);
  const markB = ['union','b-a'].includes(operation);
  const markI = ['union','intersection'].includes(operation);
  const leftOnly = a.filter(x => !b.includes(x)); const shared = a.filter(x => b.includes(x)); const rightOnly = b.filter(x => !a.includes(x));
  return <div className="venn-stage"><div className="universal-boundary"><span className="universal-label">U</span><div className={`venn-circle circle-a ${markA ? 'highlight' : ''} ${operation === 'intersection' ? 'dim' : ''}`}><span className="circle-label">A</span><div className="region-elements left-elements">{operation === 'b-a' || operation === 'product' || operation === 'power' ? '' : leftOnly.slice(0,5).map((x,i)=><i key={i}>{x}</i>)}</div></div><div className={`venn-circle circle-b ${markB ? 'highlight' : ''} ${operation === 'a-b' || operation === 'complement' ? 'dim' : ''}`}><span className="circle-label">B</span><div className="region-elements right-elements">{operation === 'a-b' || operation === 'complement' || operation === 'product' || operation === 'power' ? '' : rightOnly.slice(0,5).map((x,i)=><i key={i}>{x}</i>)}</div></div><div className={`region-elements overlap-elements ${markI ? 'overlap-on' : ''}`}>{operation === 'intersection' || operation === 'union' ? shared.slice(0,5).map((x,i)=><i key={i}>{x}</i>) : ''}</div>{operation === 'complement' && <div className="outside-elements">{calculate('complement', a, b, unique([...a,...b])).slice(0,4).join(', ') || ' '}</div>}</div></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
