const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'json', 'xml', 'html', 'htm', 'js', 'ts', 'tsx', 'jsx', 'css', 'scss', 'srt', 'vtt', 'rtf', 'yml', 'yaml'
]);

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function extensionOf(file: File) {
  const parts = file.name.toLowerCase().split('.');
  return parts.length > 1 ? parts.at(-1) || '' : '';
}

function isTextLike(file: File) {
  return file.type.startsWith('text/') || TEXT_EXTENSIONS.has(extensionOf(file));
}

export async function buildAttachmentContext(files: File[]) {
  if (!files.length) return '';

  const chunks: string[] = [];

  for (const file of files.slice(0, 8)) {
    const meta = `Plik: ${file.name} | typ: ${file.type || 'unknown'} | rozmiar: ${formatSize(file.size)}`;
    if (!isTextLike(file)) {
      chunks.push(`${meta} | zawartosc binarna lub nierozpoznana - uwzglednij plik jako material zrodlowy.`);
      continue;
    }

    try {
      const text = (await file.text()).replace(/\s+/g, ' ').trim();
      const snippet = text.slice(0, 1800);
      chunks.push(`${meta} | fragment: ${snippet || 'brak czytelnej tresci'}`);
    } catch {
      chunks.push(`${meta} | nie udalo sie odczytac tresci, ale plik nadal jest dolaczony jako zrodlo.`);
    }
  }

  return chunks.length ? `\n\nDodatkowe pliki zrodlowe:\n${chunks.map((chunk) => `- ${chunk}`).join('\n')}` : '';
}
