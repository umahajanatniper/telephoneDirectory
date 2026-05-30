const input = document.querySelector("#search-input");
const form = document.querySelector("#search-form");
const grid = document.querySelector("#results-grid");
const resultsTitle = document.querySelector("#results-title");
const resultsMeta = document.querySelector("#results-meta");
const totalRecordsBadge = document.querySelector("#total-records");
const submitButton = form.querySelector('button[type="submit"]');
const emptyStateTemplate = document.querySelector("#empty-state-template");
const displayColumns = JSON.parse(grid.dataset.columns || "[]");
const initialTotal = Number(totalRecordsBadge?.textContent || 0);

let activeController;

function renderResults(results, query, totalRecordsCount) {
  grid.innerHTML = "";

  if (!results.length) {
    grid.append(emptyStateTemplate.content.cloneNode(true));
  }

  for (const record of results) {
    const article = document.createElement("article");
    article.className = "result-card";

    const kicker = document.createElement("p");
    kicker.className = "card-kicker";
    kicker.textContent = record._role || "Directory Entry";

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

  if (resultsTitle) {
    resultsTitle.textContent = query
      ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`
      : "All contacts";
  }

  if (resultsMeta) {
    resultsMeta.textContent = query
      ? `Showing ${results.length} of ${totalRecordsCount} indexed contacts.`
      : `Showing all ${totalRecordsCount} indexed contacts.`;
  }

  if (totalRecordsBadge) {
    totalRecordsBadge.textContent = totalRecordsCount;
  }
}

function setLoading(isLoading) {
  grid.classList.toggle("is-loading", isLoading);
  grid.setAttribute("aria-busy", String(isLoading));
  submitButton.disabled = isLoading;
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
    setLoading(true);
    try {
      const payload = await fetchResults(query);
      renderResults(payload.results, payload.query, payload.metadata.total_records);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      if (resultsMeta) {
        resultsMeta.textContent = "Unable to load results right now.";
      }
    } finally {
      setLoading(false);
    }
  }, 200);
}

if (resultsTitle) {
  resultsTitle.textContent = "All contacts";
}
if (resultsMeta) {
  resultsMeta.textContent = `Showing all ${initialTotal} indexed contacts.`;
}

input.addEventListener("input", queueSearch);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  queueSearch();
});