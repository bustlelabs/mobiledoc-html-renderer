/* global QUnit */
import {
  createElement
} from 'mobiledoc-html-renderer/utils/dom';
import Renderer from 'mobiledoc-html-renderer';
import ImageCard from 'mobiledoc-html-renderer/cards/image';
import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  CARD_SECTION_TYPE,
  IMAGE_SECTION_TYPE
} from 'mobiledoc-html-renderer/utils/section-types';

import {
  MARKUP_MARKER_TYPE,
  ATOM_MARKER_TYPE
} from 'mobiledoc-html-renderer/utils/marker-types';

const { test, module } = QUnit;
const MOBILEDOC_VERSION = '0.3.0';
const MOBILEDOC_VERSION_0_3_1 = '0.3.1';
const dataUri = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";

let renderer;
module('Unit: Mobiledoc HTML Renderer - 0.3', {
  beforeEach() {
    renderer = new Renderer();
  }
});

test('renders an empty mobiledoc', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: []
  };
  let { result: rendered } = renderer.render(mobiledoc);

  assert.ok(rendered, 'renders output');
  assert.equal(rendered, '<div></div>', 'output is empty');
});

test('renders a mobiledoc without markups', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered,
               '<div><p>hello world</p></div>');
});

test('renders a mobiledoc with aside without markups', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION_0_3_1,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'ASIDE', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered,
               '<div><aside>hello world</aside></div>');
});

test('renders a mobiledoc with simple (no attributes) markup', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['B']
    ],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [0], 1, 'hello world']]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '<div><p><b>hello world</b></p></div>');
});

test('renders a mobiledoc with complex (has attributes) markup', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['A', ['href', 'http://google.com']],
    ],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [0], 1, 'hello world']
      ]]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '<div><p><a href="http://google.com">hello world</a></p></div>');
});

test('renders a mobiledoc with multiple markups in a section', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['B'],
      ['I']
    ],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [0], 0, 'hello '], // b
        [MARKUP_MARKER_TYPE, [1], 0, 'brave '], // b+i
        [MARKUP_MARKER_TYPE, [], 1, 'new '], // close i
        [MARKUP_MARKER_TYPE, [], 1, 'world'] // close b
      ]]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '<div><p><b>hello <i>brave new </i>world</b></p></div>');
});

test('renders a mobiledoc with image section', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [IMAGE_SECTION_TYPE, dataUri]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, `<div><img src="${dataUri}"></div>`);
});

test('renders a mobiledoc with built-in image card', (assert) => {
  assert.expect(1);
  let cardName = ImageCard.name;
  let payload = { src: dataUri };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName, payload]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);

  assert.equal(rendered, `<div><div><img src="${dataUri}"></div></div>`);
});

test('render mobiledoc with list section and list items', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [LIST_SECTION_TYPE, 'ul', [
        [[MARKUP_MARKER_TYPE, [], 0, 'first item']],
        [[MARKUP_MARKER_TYPE, [], 0, 'second item']]
      ]]
    ]
  };
  const { result: rendered } = renderer.render(mobiledoc);

  assert.equal(rendered,
               '<div><ul><li>first item</li><li>second item</li></ul></div>');
});

test('renders a mobiledoc with card section', (assert) => {
  assert.expect(6);

  let cardName = 'title-card';
  let expectedPayload = {};
  let expectedOptions = {};
  let titleCard = {
    name: cardName,
    type: 'html',
    render: ({env, payload, options}) => {
      assert.deepEqual(payload, expectedPayload, 'correct payload');
      assert.deepEqual(options, expectedOptions, 'correct options');
      assert.equal(env.name, cardName, 'correct name');
      assert.ok(!env.isInEditor, 'isInEditor correct');
      assert.ok(!!env.onTeardown, 'has onTeardown hook');

      return 'Howdy friend';
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName, expectedPayload]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  renderer = new Renderer({cards: [titleCard], cardOptions: expectedOptions});
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '<div><div>Howdy friend</div></div>');
});

test('throws when given invalid card type', (assert) => {
  let card = {
    name: 'bad',
    type: 'other',
    render() {}
  };
  assert.throws(
    () => { new Renderer({cards:[card]}) }, // jshint ignore:line
    /Card "bad" must be of type "html"/);
});

test('throws when given card without `render`', (assert) => {
  let card = {
    name: 'bad',
    type: 'html',
    render: undefined
  };
  assert.throws(
    () => { new Renderer({cards:[card]}) }, // jshint ignore:line
    /Card "bad" must define.*render/);
});

test('throws if card render returns invalid result', (assert) => {
  let card = {
    name: 'bad',
    type: 'html',
    render() {
      return Object.create(null);
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [card.name]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  renderer = new Renderer({cards: [card]});
  assert.throws(
    () => renderer.render(mobiledoc),
    /Card "bad" must render html/
  );
});

test('card may render nothing', (assert) => {
  let card = {
    name: 'ok',
    type: 'html',
    render() {}
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [card.name]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };

  renderer = new Renderer({cards:[card]});
  renderer.render(mobiledoc);

  assert.ok(true, 'No error thrown');
});

test('rendering nested mobiledocs in cards', (assert) => {
  let cards = [{
    name: 'nested-card',
    type: 'html',
    render({payload}) {
      let {result: rendered} = renderer.render(payload.mobiledoc);
      return rendered;
    }
  }];

  let innerMobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ]
    ]
  };

  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      ['nested-card', {mobiledoc: innerMobiledoc}]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };

  renderer = new Renderer({cards});
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '<div><div><div><p>hello world</p></div></div></div>');
});

test('rendering unknown card without unknownCardHandler throws', (assert) => {
  let cardName = 'missing-card';
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  renderer = new Renderer({cards: [], unknownCardHandler: undefined});

  assert.throws(
    () => renderer.render(mobiledoc),
    /Card "missing-card" not found.*no unknownCardHandler/
  );
});

test('rendering unknown card uses unknownCardHandler', (assert) => {
  assert.expect(5);

  let cardName = 'missing-card';
  let expectedPayload = {};
  let cardOptions = {};
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName, expectedPayload]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  let unknownCardHandler = ({env, payload, options}) => {
    assert.equal(env.name, cardName, 'correct name');
    assert.ok(!env.isInEditor, 'correct isInEditor');
    assert.ok(!!env.onTeardown, 'onTeardown hook exists');

    assert.deepEqual(payload, expectedPayload, 'correct payload');
    assert.deepEqual(options, cardOptions, 'correct options');
  };
  renderer = new Renderer({cards: [], unknownCardHandler, cardOptions});
  renderer.render(mobiledoc);
});

test('throws if given an object of cards', (assert) => {
  let cards = {};
  assert.throws(
    () => { new Renderer({cards}) }, // jshint ignore: line
    new RegExp('`cards` must be passed as an array')
  );
});

test('teardown hook calls registered teardown methods', (assert) => {
  let didTeardown;
  let card = {
    name: 'hasteardown',
    type: 'html',
    render({env}) {
      env.onTeardown(() => didTeardown = true);
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [card.name]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  renderer = new Renderer({cards: [card]});
  let { teardown } = renderer.render(mobiledoc);

  assert.ok(!didTeardown, 'precond - no teardown yet');

  teardown();

  assert.ok(didTeardown, 'teardown hook called');
});

test('multiple spaces should preserve whitespace with nbsps', (assert) => {
  let space = ' ';
  let repeat = (str, count) => {
    let result = '';
    while (count--) {
      result += str;
    }
    return result;
  };
  let text = [
    repeat(space, 4), 'some',
    repeat(space, 5), 'text',
    repeat(space, 6)
  ].join('');
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'p', [
        [MARKUP_MARKER_TYPE, [], 0, text]
      ]]
    ]
  };
  const { result: rendered } = renderer.render(mobiledoc);

  let sn = ' &nbsp;';
  let expectedText = [
    repeat(sn, 2), 'some',
    repeat(sn, 2), ' ', 'text',
    repeat(sn, 3)
  ].join('');
  assert.equal(rendered,
               `<div><p>${expectedText}</p></div>`);
});

test('throws when given an unexpected mobiledoc version', (assert) => {
  let mobiledoc = {
    version: '0.1.0',
    atoms: [],
    cards: [],
    markups: [],
    sections: []
  };
  assert.throws(
    () => renderer.render(mobiledoc),
    /Unexpected Mobiledoc version.*0.1.0/);

  mobiledoc.version = '0.2.1';
  assert.throws(
    () => renderer.render(mobiledoc),
    /Unexpected Mobiledoc version.*0.2.1/);
});

test('XSS: unexpected markup and list section tag names are not renderered', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'script', [
        [MARKUP_MARKER_TYPE, [], 0, 'alert("markup section XSS")']
      ]],
      [LIST_SECTION_TYPE, 'script', [
        [[MARKUP_MARKER_TYPE, [], 0, 'alert("list section XSS")']]
      ]]
    ]
  };
  let { result } = renderer.render(mobiledoc);
  assert.ok(result.indexOf('script') === -1, 'no script tag rendered');
});

test('XSS: unexpected markup types are not rendered', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['b'], // valid
      ['em'], // valid
      ['script'] // invalid
    ],
    sections: [
      [MARKUP_SECTION_TYPE, 'p', [
        [MARKUP_MARKER_TYPE, [0], 0, 'bold text'],
        [MARKUP_MARKER_TYPE, [1,2], 3, 'alert("markup XSS")'],
        [MARKUP_MARKER_TYPE, [], 0, 'plain text']
      ]]
    ]
  };
  let { result } = renderer.render(mobiledoc);
  assert.ok(result.indexOf('script') === -1, 'no script tag rendered');
});

test('renders a mobiledoc with atom', (assert) => {
  let atomName = 'hello-atom';
  let atom = {
    name: atomName,
    type: 'html',
    render({ value }) {
      return `Hello ${value}`;
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['hello-atom', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };
  renderer = new Renderer({atoms: [atom]});
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '<div><p>Hello Bob</p></div>');
});

test('throws when given atom with invalid type', (assert) => {
  let atom = {
    name: 'bad',
    type: 'other',
    render() {}
  };
  assert.throws(
    () => { new Renderer({atoms: [atom]}); }, // jshint ignore:line
    /Atom "bad" must be type "html"/
  );
});

test('throws when given atom without `render`', (assert) => {
  let atom = {
    name: 'bad',
    type: 'html',
    render: undefined
  };
  assert.throws(
    () => { new Renderer({atoms: [atom]}); }, // jshint ignore:line
    /Atom "bad" must define.*render/
  );
});

test('throws if atom render returns invalid result', (assert) => {
  let atom = {
    name: 'bad',
    type: 'html',
    render() {
      return Object.create(null);
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['bad', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };
  renderer = new Renderer({atoms: [atom]});
  assert.throws(
    () => renderer.render(mobiledoc),
    /Atom "bad" must render html/
  );
});

test('atom may render nothing', (assert) => {
  let atom = {
    name: 'ok',
    type: 'html',
    render() {}
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['ok', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };

  renderer = new Renderer({atoms:[atom]});
  renderer.render(mobiledoc);

  assert.ok(true, 'No error thrown');
});

test('throws when rendering unknown atom without unknownAtomHandler', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['missing-atom', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };
  renderer = new Renderer({atoms: [], unknownAtomHandler: undefined});
  assert.throws(
    () => renderer.render(mobiledoc),
    /Atom "missing-atom" not found.*no unknownAtomHandler/
  );
});

test('rendering unknown atom uses unknownAtomHandler', (assert) => {
  assert.expect(4);

  let atomName = 'missing-atom';
  let expectedPayload = { id: 42 };
  let cardOptions = {};
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['missing-atom', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };
  let unknownAtomHandler = ({env, payload, options}) => {
    assert.equal(env.name, atomName, 'correct name');
    assert.ok(!!env.onTeardown, 'onTeardown hook exists');

    assert.deepEqual(payload, expectedPayload, 'correct payload');
    assert.deepEqual(options, cardOptions, 'correct options');
  };
  renderer = new Renderer({atoms: [], unknownAtomHandler, cardOptions});
  renderer.render(mobiledoc);
});

test('renders a mobiledoc with sectionElementRenderer', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ],
      [MARKUP_SECTION_TYPE, 'p', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ],
      [MARKUP_SECTION_TYPE, 'h1', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ]
    ]
  };
  renderer = new Renderer({
    sectionElementRenderer: {
      p: () => createElement('pre'),
      H1: () => createElement('h2')
    }
  });
  let renderResult = renderer.render(mobiledoc);
  let { result: rendered } = renderResult;
  assert.equal(rendered, '<div><pre>hello world</pre><pre>hello world</pre><h2>hello world</h2></div>');
});
