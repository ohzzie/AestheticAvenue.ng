/*
  Collections UI: accessible filters, sorting, URL state, lazy images
  - Loads mock data from window.COLLECTIONS_DATA_URL (set in template)
  - Renders chips for tags, text search, and sort select
  - Syncs state <-> URL (q, sort, tags)
  - Announces results count via aria-live
*/
(function () {
  const DATA_URL = window.COLLECTIONS_DATA_URL || '/static/data/collections.json';
  const $grid = document.getElementById('collections-grid');
  const $status = document.getElementById('status');
  const $chips = document.getElementById('chip-container');
  const $form = document.getElementById('filters-form');
  const $q = document.getElementById('q');
  const $sort = document.getElementById('sort');

  /** State **/
  let all = [];
  let tagsAll = [];
  const state = {
    q: '',
    tags: new Set(),
    sort: 'name-asc'
  };

  function parseQS() {
    const p = new URLSearchParams(location.search);
    state.q = p.get('q') || '';
    state.sort = p.get('sort') || 'name-asc';
    const tagStr = p.get('tags') || '';
    state.tags = new Set(tagStr.split(',').map(s => s.trim()).filter(Boolean));
  }

  function writeQS(replace = true) {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.sort && state.sort !== 'name-asc') p.set('sort', state.sort);
    if (state.tags.size) p.set('tags', Array.from(state.tags).join(','));
    const next = `${location.pathname}?${p.toString()}`;
    (replace ? history.replaceState : history.pushState).call(history, null, '', next);
  }

  function setupControls() {
    $q.value = state.q;
    $sort.value = state.sort;
    // Chips
    $chips.innerHTML = '';
    tagsAll.forEach(tag => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.textContent = tag;
      btn.setAttribute('aria-pressed', state.tags.has(tag) ? 'true' : 'false');
      btn.setAttribute('data-tag', tag);
      btn.title = `Filter by ${tag}`;
      btn.addEventListener('click', () => toggleTag(tag, btn));
      btn.addEventListener('keydown', (e) => {
        // Space toggles for better accessibility
        if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); toggleTag(tag, btn); }
      });
      $chips.appendChild(btn);
    });

    $q.addEventListener('input', () => { state.q = $q.value.trim(); writeQS(); render(); });
    $sort.addEventListener('change', () => { state.sort = $sort.value; writeQS(); render(); });
    $form.addEventListener('submit', (e) => { e.preventDefault(); });
  }

  function toggleTag(tag, el) {
    if (state.tags.has(tag)) { state.tags.delete(tag); el.setAttribute('aria-pressed', 'false'); }
    else { state.tags.add(tag); el.setAttribute('aria-pressed', 'true'); }
    writeQS();
    render();
  }

  function filterSort(items) {
    const q = state.q.toLowerCase();
    const active = Array.from(state.tags);
    let res = items.filter(it => {
      const hitQ = !q || (it.title.toLowerCase().includes(q) || (it.description||'').toLowerCase().includes(q));
      const hitTags = active.length === 0 || active.every(t => it.tags.includes(t));
      return hitQ && hitTags;
    });
    const [k, dir] = state.sort.split('-');
    res.sort((a, b) => {
      let va, vb;
      if (k === 'name') { va = a.title.toLowerCase(); vb = b.title.toLowerCase(); }
      else { va = a.itemCount; vb = b.itemCount; }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return res;
  }

  function render() {
    const items = filterSort(all);
    // Status for screen readers
    $status.textContent = `${items.length} collection${items.length === 1 ? '' : 's'} shown`;

    // Grid
    $grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    items.forEach(it => frag.appendChild(card(it)));
    $grid.appendChild(frag);
  }

  function card(it) {
    const li = document.createElement('li');
    li.className = 'collection-card';
    li.setAttribute('role', 'listitem');

    const article = document.createElement('article');
    article.className = 'collection-card__inner';
    article.setAttribute('aria-labelledby', `ttl-${it.id}`);

    const a = document.createElement('a');
    a.href = `/collections/${encodeURIComponent(it.slug)}`;
    a.className = 'collection-card__media';
    a.setAttribute('aria-label', `Open ${it.title} collection`);

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = it.image;
    img.alt = it.title;
    img.width = 800; // intrinsic to help CLS
    img.height = 600; // 4:3
    a.appendChild(img);

    const body = document.createElement('div');
    body.className = 'collection-card__body';

    const h3 = document.createElement('h3');
    h3.className = 'collection-card__title';
    h3.id = `ttl-${it.id}`;
    h3.textContent = it.title;

    const meta = document.createElement('div');
    meta.className = 'collection-card__meta';
    meta.textContent = `${it.itemCount} item${it.itemCount === 1 ? '' : 's'}`;

    body.appendChild(h3);
    if (it.description) {
      const p = document.createElement('p');
      p.className = 'collection-card__desc';
      p.textContent = it.description;
      body.appendChild(p);
    }
    body.appendChild(meta);

    article.appendChild(a);
    article.appendChild(body);
    li.appendChild(article);
    return li;
  }

  async function init() {
    parseQS();
    try {
      const res = await fetch(DATA_URL, { credentials: 'same-origin' });
      all = await res.json();
      // collect unique tags
      const s = new Set();
      all.forEach(it => (it.tags||[]).forEach(t => s.add(t)));
      tagsAll = Array.from(s).sort((a,b)=>a.localeCompare(b));
      setupControls();
      render();
    } catch (err) {
      console.error('Failed to load collections', err);
      $status.textContent = 'Failed to load collections.';
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();

