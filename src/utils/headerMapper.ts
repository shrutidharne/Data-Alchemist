// @ts-ignore
const Fuse = require('fuse.js');

// Canonical schema for all entities
const canonicalHeaders = [
  // Clients
  'ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON',
  // Workers
  'WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel',
  // Tasks
  'TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent',
];

// Normalize header for matching
function normalize(str: string) {
  return str.replace(/[_\s]/g, '').toLowerCase();
}

// Fuzzy matching options
const fuse = new Fuse(canonicalHeaders, {
  includeScore: true,
  threshold: 0.4,
  keys: [],
});

export function mapHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  headers.forEach((header) => {
    // Try exact normalized match first
    const norm = normalize(header);
    const exact = canonicalHeaders.find(h => normalize(h) === norm);
    if (exact) {
      mapping[header] = exact;
      return;
    }
    // Fuzzy match fallback
    const result = fuse.search(header);
    if (result.length > 0 && result[0].score! < 0.4) {
      mapping[header] = result[0].item;
    } else {
      mapping[header] = header; // fallback to original
    }
  });
  return mapping;
}

export function remapRow(row: Record<string, any>, mapping: Record<string, string>): Record<string, any> {
  const remapped: Record<string, any> = {};
  Object.keys(row).forEach((key) => {
    remapped[mapping[key] || key] = row[key];
  });
  return remapped;
} 