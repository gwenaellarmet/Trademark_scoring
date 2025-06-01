const apiUrl = '/trademarks';
const docApiUrl = '/documents';

const form = document.getElementById('trademark-form');
const idInput = document.getElementById('trademark-id');
const nameInput = document.getElementById('trademark-name');
const dateInput = document.getElementById('trademark-date');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tableBody = document.querySelector('#trademark-table tbody');

// Document modal elements
const docModal = document.getElementById('document-modal');
const docModalTitle = document.getElementById('doc-modal-title');
const docForm = document.getElementById('document-form');
const docIdInput = document.getElementById('document-id');
const docTitleInput = document.getElementById('document-title');
const docMimeInput = document.getElementById('document-mime');
const docContentInput = document.getElementById('document-content');
const docDateInput = document.getElementById('document-date');
const docSubmitBtn = document.getElementById('doc-submit-btn');
const docCancelBtn = document.getElementById('doc-cancel-btn');
const docTableBody = document.querySelector('#document-table tbody');
const closeDocModalBtn = document.getElementById('close-doc-modal');

let editing = false;
let editingDoc = false;
let currentTrademarkId = null;

async function fetchTrademarks() {
  const res = await fetch(apiUrl);
  const trademarks = await res.json();

  // Fetch document counts for each trademark
  const docCounts = {};
  const docRes = await fetch(docApiUrl);
  const docs = await docRes.json();
  docs.forEach(doc => {
    docCounts[doc.trademark_id] = (docCounts[doc.trademark_id] || 0) + 1;
  });

  renderTable(trademarks, docCounts);
}

function renderTable(trademarks, docCounts) {
  tableBody.innerHTML = '';
  trademarks.forEach(trademark => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${trademark.name}</td>
      <td>${trademark.registration_date ? trademark.registration_date.split('T')[0] : ''}</td>
      <td>${trademark.score ?? 0}</td>
      <td>
        <button data-id="${trademark.id}" class="docs-btn">
          ${docCounts[trademark.id] || 0} document${docCounts[trademark.id] === 1 ? '' : 's'}
        </button>
      </td>
      <td>
        <button data-id="${trademark.id}" class="edit-btn">Edit</button>
        <button data-id="${trademark.id}" class="delete-btn" style="background:#e00;color:#fff;">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const registration_date = dateInput.value;
  if (!name || !registration_date) return;

  if (editing) {
    const id = idInput.value;
    await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, registration_date })
    });
  } else {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, registration_date })
    });
  }
  form.reset();
  editing = false;
  submitBtn.textContent = 'Add Trademark';
  cancelBtn.style.display = 'none';
  await fetchTrademarks();
});

tableBody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const id = e.target.dataset.id;
    const res = await fetch(`${apiUrl}/${id}`);
    const trademark = await res.json();
    idInput.value = trademark.id;
    nameInput.value = trademark.name;
    dateInput.value = trademark.registration_date ? trademark.registration_date.split('T')[0] : '';
    editing = true;
    submitBtn.textContent = 'Update Trademark';
    cancelBtn.style.display = '';
  }
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    if (confirm('Delete this trademark?')) {
      await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      await fetchTrademarks();
    }
  }
  if (e.target.classList.contains('docs-btn')) {
    currentTrademarkId = e.target.dataset.id;
    await openDocumentModal(currentTrademarkId);
  }
});

cancelBtn.addEventListener('click', () => {
  form.reset();
  editing = false;
  submitBtn.textContent = 'Add Trademark';
  cancelBtn.style.display = 'none';
});

// Document Modal Logic

async function openDocumentModal(trademarkId) {
  docModalTitle.textContent = `Documents for Trademark #${trademarkId}`;
  docForm.reset();
  docIdInput.value = '';
  editingDoc = false;
  docSubmitBtn.textContent = 'Add Document';
  docCancelBtn.style.display = 'none';
  await fetchAndRenderDocuments(trademarkId);
  docModal.showModal();
}

async function fetchAndRenderDocuments(trademarkId) {
  const res = await fetch(docApiUrl);
  const docs = await res.json();
  const filtered = docs.filter(doc => doc.trademark_id == trademarkId);
  docTableBody.innerHTML = '';
  filtered.forEach(doc => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${doc.title}</td>
      <td>${doc.document_date ? doc.document_date.split('T')[0] : ''}</td>
      <td>${doc.type || ''}</td>
      <td>
        <button data-id="${doc.id}" class="doc-edit-btn">Edit</button>
        <button data-id="${doc.id}" class="doc-delete-btn" style="background:#e00;color:#fff;">Delete</button>
      </td>
    `;
    docTableBody.appendChild(tr);
  });
}

docForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = docTitleInput.value.trim();
  const mime_type = docMimeInput.value.trim();
  const content = docContentInput.value.trim();
  const document_date = docDateInput.value;
  if (!title || !mime_type || !content || !document_date) return;

  if (editingDoc) {
    const id = docIdInput.value;
    await fetch(`${docApiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, mime_type, content, document_date, trademark_id: currentTrademarkId })
    });
  } else {
    await fetch(docApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, mime_type, content, document_date, trademark_id: currentTrademarkId })
    });
  }
  docForm.reset();
  editingDoc = false;
  docSubmitBtn.textContent = 'Add Document';
  docCancelBtn.style.display = 'none';
  await fetchAndRenderDocuments(currentTrademarkId);
  await fetchTrademarks();
});

docTableBody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('doc-edit-btn')) {
    const id = e.target.dataset.id;
    const res = await fetch(`${docApiUrl}/${id}`);
    const doc = await res.json();
    docIdInput.value = doc.id;
    docTitleInput.value = doc.title;
    docMimeInput.value = doc.mime_type;
    docContentInput.value = doc.content;
    docDateInput.value = doc.document_date ? doc.document_date.split('T')[0] : '';
    editingDoc = true;
    docSubmitBtn.textContent = 'Update Document';
    docCancelBtn.style.display = '';
  }
  if (e.target.classList.contains('doc-delete-btn')) {
    const id = e.target.dataset.id;
    if (confirm('Delete this document?')) {
      await fetch(`${docApiUrl}/${id}`, { method: 'DELETE' });
      await fetchAndRenderDocuments(currentTrademarkId);
      await fetchTrademarks();
    }
  }
});

docCancelBtn.addEventListener('click', () => {
  docForm.reset();
  editingDoc = false;
  docSubmitBtn.textContent = 'Add Document';
  docCancelBtn.style.display = 'none';
});

closeDocModalBtn.addEventListener('click', () => {
  docModal.close();
});

window.addEventListener('DOMContentLoaded', fetchTrademarks);