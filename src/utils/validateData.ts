export interface ValidationError {
  entity: 'Clients' | 'Workers' | 'Tasks';
  rowId: string;
  column?: string;
  message: string;
}

const requiredClientColumns = ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'];
const requiredWorkerColumns = ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'];
const requiredTaskColumns = ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'];

function detectCircularGroups(rows: any[], groupField: string, idField: string): string[] {
  // Build group graph
  const groupMap: Record<string, string[]> = {};
  rows.forEach(row => {
    const group = row[groupField];
    if (!groupMap[group]) groupMap[group] = [];
    groupMap[group].push(row[idField]);
  });
  // Detect cycles (simple DFS)
  const visited = new Set<string>();
  const stack = new Set<string>();
  function dfs(node: string): boolean {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    const neighbors = groupMap[node] || [];
    for (const n of neighbors) {
      if (dfs(n)) return true;
    }
    stack.delete(node);
    return false;
  }
  // Check all groups
  for (const group in groupMap) {
    stack.clear();
    if (dfs(group)) return [group];
  }
  return [];
}

export function validateClients(clients: any[], tasks: any[]): ValidationError[] {
  const errors: ValidationError[] = [];
  if (clients.length > 0) {
    const present = Object.keys(clients[0]);
    requiredClientColumns.forEach(col => {
      if (!present.includes(col)) {
        errors.push({ entity: 'Clients', rowId: 'ALL', column: col, message: `Missing required column: ${col}` });
      }
    });
  }
  const seenIds = new Set<string>();
  const taskIds = new Set(tasks.map(t => t.TaskID));

  clients.forEach((row, idx) => {
    // Duplicate IDs
    if (seenIds.has(row.ClientID)) {
      errors.push({ entity: 'Clients', rowId: row.ClientID, column: 'ClientID', message: 'Duplicate ClientID' });
    } else {
      seenIds.add(row.ClientID);
    }
    // PriorityLevel out of range
    const priority = Number(row.PriorityLevel);
    if (isNaN(priority) || priority < 1 || priority > 5) {
      errors.push({ entity: 'Clients', rowId: row.ClientID, column: 'PriorityLevel', message: 'PriorityLevel must be 1-5' });
    }
    // Broken JSON
    if (row.AttributesJSON) {
      try {
        JSON.parse(row.AttributesJSON);
      } catch {
        errors.push({ entity: 'Clients', rowId: row.ClientID, column: 'AttributesJSON', message: 'Malformed JSON' });
      }
    }
    // Unknown references in RequestedTaskIDs
    if (row.RequestedTaskIDs) {
      const taskIdsStr = String(row.RequestedTaskIDs).trim();
      if (taskIdsStr) {
        const ids = taskIdsStr.split(',').map((id: string) => id.trim()).filter(id => id.length > 0);
        if (ids.length === 0) {
          errors.push({ entity: 'Clients', rowId: row.ClientID, column: 'RequestedTaskIDs', message: 'RequestedTaskIDs cannot be empty' });
        } else {
          ids.forEach((id: string) => {
            if (id && !taskIds.has(id)) {
              errors.push({ entity: 'Clients', rowId: row.ClientID, column: 'RequestedTaskIDs', message: `Unknown TaskID: ${id}` });
            }
          });
        }
      } else {
        errors.push({ entity: 'Clients', rowId: row.ClientID, column: 'RequestedTaskIDs', message: 'RequestedTaskIDs cannot be empty' });
      }
    } else {
      errors.push({ entity: 'Clients', rowId: row.ClientID, column: 'RequestedTaskIDs', message: 'RequestedTaskIDs is required' });
    }
  });
  // Circular co-run groups (using GroupTag)
  const circularGroups = detectCircularGroups(clients, 'GroupTag', 'ClientID');
  if (circularGroups.length > 0) {
    errors.push({ entity: 'Clients', rowId: 'ALL', column: 'GroupTag', message: `Circular co-run group detected: ${circularGroups.join(', ')}` });
  }
  return errors;
}

export function validateWorkers(workers: any[]): ValidationError[] {
  const errors: ValidationError[] = [];
  if (workers.length > 0) {
    const present = Object.keys(workers[0]);
    requiredWorkerColumns.forEach(col => {
      if (!present.includes(col)) {
        errors.push({ entity: 'Workers', rowId: 'ALL', column: col, message: `Missing required column: ${col}` });
      }
    });
  }
  const seenIds = new Set<string>();

  workers.forEach((row, idx) => {
    // Duplicate IDs
    if (seenIds.has(row.WorkerID)) {
      errors.push({ entity: 'Workers', rowId: row.WorkerID, column: 'WorkerID', message: 'Duplicate WorkerID' });
    } else {
      seenIds.add(row.WorkerID);
    }
    // Malformed lists in AvailableSlots
    let slotsArr: any[] = [];
    if (row.AvailableSlots) {
      try {
        slotsArr = JSON.parse(row.AvailableSlots);
        if (!Array.isArray(slotsArr)) {
          errors.push({ entity: 'Workers', rowId: row.WorkerID, column: 'AvailableSlots', message: 'AvailableSlots must be a JSON array (e.g., [1,2,3])' });
        } else if (slotsArr.length === 0) {
          errors.push({ entity: 'Workers', rowId: row.WorkerID, column: 'AvailableSlots', message: 'AvailableSlots cannot be empty' });
        } else if (slotsArr.some((v: any) => isNaN(Number(v)) || Number(v) < 1)) {
          errors.push({ entity: 'Workers', rowId: row.WorkerID, column: 'AvailableSlots', message: 'AvailableSlots must contain positive integers only' });
        }
      } catch {
        errors.push({ entity: 'Workers', rowId: row.WorkerID, column: 'AvailableSlots', message: 'AvailableSlots must be valid JSON array (e.g., [1,2,3])' });
      }
    } else {
      errors.push({ entity: 'Workers', rowId: row.WorkerID, column: 'AvailableSlots', message: 'AvailableSlots is required' });
    }
    // Out-of-range MaxLoadPerPhase
    const maxLoad = Number(row.MaxLoadPerPhase);
    if (isNaN(maxLoad) || maxLoad < 1) {
      errors.push({ entity: 'Workers', rowId: row.WorkerID, column: 'MaxLoadPerPhase', message: 'MaxLoadPerPhase must be >= 1' });
    }
    // Overloaded workers
    if (Array.isArray(slotsArr) && !isNaN(maxLoad) && slotsArr.length < maxLoad) {
      errors.push({ entity: 'Workers', rowId: row.WorkerID, column: 'AvailableSlots', message: `Worker overloaded: AvailableSlots (${slotsArr.length}) < MaxLoadPerPhase (${maxLoad})` });
    }
  });
  // Circular co-run groups (using WorkerGroup)
  const circularGroups = detectCircularGroups(workers, 'WorkerGroup', 'WorkerID');
  if (circularGroups.length > 0) {
    errors.push({ entity: 'Workers', rowId: 'ALL', column: 'WorkerGroup', message: `Circular co-run group detected: ${circularGroups.join(', ')}` });
  }
  return errors;
}

// Helper function to parse PreferredPhases (supports both arrays and ranges)
function parsePreferredPhases(phasesStr: string): number[] {
  if (!phasesStr) return [];
  
  // Remove brackets and quotes
  const cleanStr = phasesStr.replace(/[\[\]"']/g, '');
  
  // Check if it's a range (e.g., "2-4")
  if (cleanStr.includes('-')) {
    const [start, end] = cleanStr.split('-').map(s => parseInt(s.trim()));
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }
  
  // Parse as comma-separated array
  return cleanStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}

export function validateTasks(tasks: any[], workers: any[] = []): ValidationError[] {
  const errors: ValidationError[] = [];
  if (tasks.length > 0) {
    const present = Object.keys(tasks[0]);
    requiredTaskColumns.forEach(col => {
      if (!present.includes(col)) {
        errors.push({ entity: 'Tasks', rowId: 'ALL', column: col, message: `Missing required column: ${col}` });
      }
    });
  }
  const seenIds = new Set<string>();
  // Build skill set from workers
  const allWorkerSkills = new Set<string>();
  workers.forEach(w => {
    if (w.Skills) {
      String(w.Skills).split(',').map((s: string) => s.trim()).forEach((s: string) => allWorkerSkills.add(s));
    }
  });

  tasks.forEach((row, idx) => {
    // Duplicate IDs
    if (seenIds.has(row.TaskID)) {
      errors.push({ entity: 'Tasks', rowId: row.TaskID, column: 'TaskID', message: 'Duplicate TaskID' });
    } else {
      seenIds.add(row.TaskID);
    }
    // Out-of-range Duration
    const duration = Number(row.Duration);
    if (isNaN(duration) || duration < 1) {
      errors.push({ entity: 'Tasks', rowId: row.TaskID, column: 'Duration', message: 'Duration must be >= 1' });
    }
    // MaxConcurrent must be >= 1
    const maxConc = Number(row.MaxConcurrent);
    if (isNaN(maxConc) || maxConc < 1) {
      errors.push({ entity: 'Tasks', rowId: row.TaskID, column: 'MaxConcurrent', message: 'MaxConcurrent must be >= 1' });
    }
    // Skill-coverage matrix
    if (row.RequiredSkills) {
      String(row.RequiredSkills).split(',').map((s: string) => s.trim()).forEach((skill: string) => {
        if (skill && !allWorkerSkills.has(skill)) {
          errors.push({ entity: 'Tasks', rowId: row.TaskID, column: 'RequiredSkills', message: `No worker covers skill: ${skill}` });
        }
      });
    }
    // Max-concurrency feasibility
    if (row.RequiredSkills && workers.length > 0) {
      const qualifiedWorkers = workers.filter(w => w.Skills && String(w.Skills).split(',').map((s: string) => s.trim()).some((s: string) => row.RequiredSkills.includes(s)));
      if (qualifiedWorkers.length > 0 && maxConc > qualifiedWorkers.length) {
        errors.push({ entity: 'Tasks', rowId: row.TaskID, column: 'MaxConcurrent', message: `MaxConcurrent (${maxConc}) > qualified workers (${qualifiedWorkers.length})` });
      }
    }
    // Validate PreferredPhases format
    if (row.PreferredPhases) {
      const phases = parsePreferredPhases(row.PreferredPhases);
      if (phases.length === 0) {
        errors.push({ entity: 'Tasks', rowId: row.TaskID, column: 'PreferredPhases', message: 'Invalid PreferredPhases format (use [1,2,3] or "2-4")' });
      }
    }
  });
  
  // Phase-slot saturation: sum of task durations per phase ≤ total worker slots
  // Build phase-task map using the new parser
  const phaseDurations: Record<string, number> = {};
  tasks.forEach(row => {
    if (row.PreferredPhases) {
      const phases = parsePreferredPhases(row.PreferredPhases);
      const duration = Number(row.Duration);
      phases.forEach(phase => {
        if (!phaseDurations[phase]) phaseDurations[phase] = 0;
        if (!isNaN(duration)) phaseDurations[phase] += duration;
      });
    }
  });
  
  // Count total worker slots
  let totalSlots = 0;
  workers.forEach(w => {
    if (w.AvailableSlots) {
      try {
        const arr = JSON.parse(w.AvailableSlots);
        if (Array.isArray(arr)) totalSlots += arr.length;
      } catch {}
    }
  });
  
  for (const phase in phaseDurations) {
    if (phaseDurations[phase] > totalSlots) {
      errors.push({ entity: 'Tasks', rowId: 'ALL', column: 'PreferredPhases', message: `Phase ${phase} oversaturated: total task durations (${phaseDurations[phase]}) > total worker slots (${totalSlots})` });
    }
  }
  return errors;
}
