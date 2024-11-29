const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const articleNumberInput = document.getElementById('articleNumber');
const includePlanCheckbox = document.getElementById('includePlan');
const previewContainer = document.getElementById('previewContainer');
const processButton = document.getElementById('processButton');
const downloadAllButton = document.getElementById('downloadAllButton');
const output = document.getElementById('output');

let uploadedFiles = [];
let renamedFiles = [];

// Handle file uploads
function handleFiles(files) {
  uploadedFiles = Array.from(files);
  displayPreview();
}

// Display preview of uploaded files
function displayPreview() {
  previewContainer.innerHTML = '';
  uploadedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      previewContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

// Process files and generate renamed outputs
function processFiles() {
  const articleNumber = articleNumberInput.value.trim();
  if (!articleNumber) {
    alert('Vul een artikelnummer in!');
    return;
  }

  const includePlan = includePlanCheckbox.checked;
  renamedFiles = [];
  let increment = 0;

  // Add first file (nulfoto)
  if (uploadedFiles.length > 0) {
    renamedFiles.push({
      originalFile: uploadedFiles[0],
      newName: formatFilename(incrementArticleNumber(articleNumber, increment)),
    });
    increment++;
  }

  // Add plattegrond if included
  if (includePlan && uploadedFiles.length > 1) {
    renamedFiles.push({
      originalFile: uploadedFiles[1],
      newName: formatFilename(incrementArticleNumber(articleNumber, 0), true),
    });
  }

  // Add remaining files
  for (let i = includePlan ? 2 : 1; i < uploadedFiles.length; i++) {
    renamedFiles.push({
      originalFile: uploadedFiles[i],
      newName: formatFilename(incrementArticleNumber(articleNumber, increment)),
    });
    increment++;
  }

  displayRenamedFiles(renamedFiles);
}

// Display renamed files
function displayRenamedFiles(renamedFiles) {
  output.innerHTML = '';
  renamedFiles.forEach(({ originalFile, newName }, i) => {
    const link = document.createElement('a');
    link.textContent = `${i + 1}. ${newName}`;
    link.href = URL.createObjectURL(originalFile);
    link.download = newName;
    output.appendChild(link);
  });
}

// Download all renamed files as a zip
async function downloadAllFiles() {
  if (renamedFiles.length === 0) {
    alert('Geen bestanden om te downloaden. Klik eerst op "Bestanden hernoemen".');
    return;
  }

  const zip = new JSZip();

  for (const { originalFile, newName } of renamedFiles) {
    const fileData = await originalFile.arrayBuffer();
    zip.file(newName, fileData);
  }

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'hernoemde_afbeeldingen.zip';
    link.click();
  });
}

// Helper functions
function incrementArticleNumber(baseName, increment) {
  const parts = baseName.split('-');
  const lastNumber = parseInt(parts.pop(), 10) + increment;
  parts.push(lastNumber);
  return parts.join('-');
}

function formatFilename(baseName, isPlan = false) {
  return isPlan ? `${baseName}_pl.jpg` : `${baseName}.jpg`;
}

// Event Listeners
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
processButton.addEventListener('click', processFiles);
downloadAllButton.addEventListener('click', downloadAllFiles);
