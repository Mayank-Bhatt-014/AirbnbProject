document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('conciergeForm');
  const input = document.getElementById('queryInput');
  const results = document.getElementById('results');
  const error = document.getElementById('error');

  function showError(msg) {
    error.textContent = msg;
  }

  function clearError() {
    error.textContent = '';
  }

  function renderRecommendations(data) {
    results.innerHTML = '';
    if (!data || !Array.isArray(data.recommendations) || data.recommendations.length === 0) {
      const p = document.createElement('div');
      p.className = 'empty';
      p.textContent = 'No recommendations found for your query.';
      results.appendChild(p);
      return;
    }

    data.recommendations.forEach((r) => {
      const el = document.createElement('div');
      el.className = 'rec';
      const title = document.createElement('div');
      title.innerHTML = `<strong>${r.title || 'Untitled'}</strong> ${r.score?`<span style="color:#555">(score: ${Number(r.score).toFixed(2)})</span>`:''}`;
      el.appendChild(title);

      if (r.reason) {
        const reason = document.createElement('div');
        reason.className = 'muted';
        reason.textContent = r.reason;
        el.appendChild(reason);
      }

      if (r.highlights && r.highlights.length) {
        const ul = document.createElement('ul');
        r.highlights.forEach(h => { const li = document.createElement('li'); li.textContent = h; ul.appendChild(li); });
        el.appendChild(ul);
      }

      if (r.listing) {
        const meta = document.createElement('div');
        meta.className = 'muted';
        meta.textContent = `${r.listing.location || ''} ${r.listing.price ? '• $' + r.listing.price : ''}`;
        el.appendChild(meta);
      }

      // make the whole recommendation clickable to the listing details page
      let anchor;
      const listingId = r.listing && r.listing._id ? (typeof r.listing._id === 'string' ? r.listing._id : (r.listing._id.$oid || (r.listing._id.toString ? r.listing._id.toString() : String(r.listing._id)))) : null;
      if (listingId) {
        anchor = document.createElement('a');
        anchor.href = `/listings/${listingId}`;
        anchor.className = 'rec-link';
        anchor.appendChild(el);
        results.appendChild(anchor);
      } else {
        results.appendChild(el);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    results.innerHTML = '';

    const query = input.value && input.value.trim();
    if (!query) { showError('Please enter a search query.'); return; }

    const btn = document.getElementById('searchBtn');
    btn.disabled = true;
    btn.textContent = 'Searching...';

    try {
      const resp = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!resp.ok) throw new Error('Server error');
      const data = await resp.json();
      renderRecommendations(data);
    } catch (err) {
      showError('Failed to get recommendations. Try again later.');
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Search';
    }
  });
});
