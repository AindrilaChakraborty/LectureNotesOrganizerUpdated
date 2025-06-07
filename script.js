const notesContainer = document.getElementById("notesContainer");
const keywords = ["important", "key", "note", "remember", "critical", "tip", "must", "highlight"];

// Escape & highlight keywords
function highlightText(text) {
  const escaped = text.replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m]));
  return escaped.replace(
    new RegExp(`\\b(${keywords.join("|")})\\b`, "gi"),
    '<span class="highlight">$1</span>'
  );
}

// Basic summarizer: extract 3 most relevant sentences
function summarizeText(text) {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  return sentences.slice(0, 3).join(" ");
}

// Handle PDF upload
async function handlePDF() {
  const fileInput = document.getElementById("pdfInput");
  const categoryInput = document.getElementById("noteCategory");

  if (!fileInput.files.length || !categoryInput.value.trim()) {
    alert("Please select a PDF and enter a category.");
    return;
  }

  const file = fileInput.files[0];
  const pdfData = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(" ") + " ";
  }

  const summary = summarizeText(fullText);
  const highlighted = highlightText(summary);

  // Create note card
  const noteCard = document.createElement("div");
  noteCard.className = "note-card";

  const categoryTitle = document.createElement("h4");
  categoryTitle.textContent = `📂 ${categoryInput.value.trim()}`;
  noteCard.appendChild(categoryTitle);

  const contentEl = document.createElement("p");
  contentEl.innerHTML = highlighted;
  noteCard.appendChild(contentEl);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => notesContainer.removeChild(noteCard);
  noteCard.appendChild(deleteBtn);

  notesContainer.appendChild(noteCard);

  // Clear
  fileInput.value = "";
  categoryInput.value = "";
}
