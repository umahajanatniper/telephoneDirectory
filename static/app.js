const input = document.querySelector("#search-input");
const form = document.querySelector("#search-form");
const grid = document.querySelector("#results-grid");
const resultsTitle = document.querySelector("#results-title");
const resultsMeta = document.querySelector("#results-meta");
const resultCount = document.querySelector("#result-count");
const emptyStateTemplate = document.querySelector("#empty-state-template");
const displayColumns = JSON.parse(grid.dataset.columns || "[]");

let activeController;

function renderResults(results, query, totalRecords) {
  grid.innerHTML = "";

  if (!results.length) {
    grid.append(emptyStateTemplate.content.cloneNode(true));
  }

  for (const record of results) {
    const article = document.createElement("article");
    article.className = "result-card";

    const kicker = document.createElement("p");
    kicker.className = "card-kicker";
    kicker.textContent = "Directory Entry";

    const heading = document.createElement("h3");
    heading.textContent = record._display_name || "Unnamed Entry";

    const list = document.createElement("div");
    list.className = "result-fields";

    for (const column of displayColumns) {
      if (!record[column]) {
        continue;
      }
      const wrapper = document.createElement("div");
      wrapper.className = "field-row";
      const term = document.createElement("p");
      term.className = "field-label";
      term.textContent = column;
      const detail = document.createElement("p");
      detail.className = "field-value";
      detail.textContent = record[column];
      wrapper.append(term, detail);
      list.append(wrapper);
    }

    article.append(kicker, heading, list);
    grid.append(article);
  }

  const shownCount = results.length;
  resultsTitle.textContent = query ? `Matches for "${query}"` : "Top directory matches";
  resultsMeta.textContent = query
    ? `Showing ${shownCount} matching entries from ${totalRecords} total records.`
    : `Showing ${shownCount} entries from ${totalRecords} total records.`;
  resultCount.textContent = totalRecords;
}

async function fetchResults(query) {
  if (activeController) {
    activeController.abort();
  }

  activeController = new AbortController();
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    signal: activeController.signal,
  });
  if (!response.ok) {
    throw new Error("Search request failed.");
  }
  return response.json();
}

let debounceHandle;

function queueSearch() {
  window.clearTimeout(debounceHandle);
  debounceHandle = window.setTimeout(async () => {
    const query = input.value.trim();
    try {
      const payload = await fetchResults(query);
      renderResults(payload.results, payload.query, payload.metadata.total_records);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      resultsMeta.textContent = "Unable to load results right now.";
    }
  }, 180);
}

input.addEventListener("input", queueSearch);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  queueSearch();
});