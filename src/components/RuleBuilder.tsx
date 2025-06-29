"use client";
import React, { useState } from 'react';
import {
  Box, Button, Typography, Stack, Paper, Grid, Tooltip, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Checkbox, TextField, Divider, CircularProgress, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Switch, FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import SpeedIcon from '@mui/icons-material/Speed';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PatternIcon from '@mui/icons-material/Pattern';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useWorkflow } from './WorkflowContext';

// Props: taskIds: string[]
interface RuleBuilderProps {
  taskIds: string[];
}

type CoRunRule = {
  type: 'coRun';
  tasks: string[];
  priority?: number;
};

type SlotRestrictionRule = {
  type: 'slotRestriction';
  group: string; // ClientGroup or WorkerGroup
  minCommonSlots: number;
  priority?: number;
};

type LoadLimitRule = {
  type: 'loadLimit';
  workerGroup: string;
  maxSlotsPerPhase: number;
  priority?: number;
};

type PhaseWindowRule = {
  type: 'phaseWindow';
  task: string;
  allowedPhases: number[];
  priority?: number;
};

type PatternMatchRule = {
  type: 'patternMatch';
  regex: string;
  template: string;
  parameters: string;
  priority?: number;
};

type Rule =
  | CoRunRule
  | SlotRestrictionRule
  | LoadLimitRule
  | PhaseWindowRule
  | PatternMatchRule;

// For AI suggestions
interface SuggestedRule {
  rule: Rule;
  description: string;
}

// Helper for icons and colors
const ruleTypeMeta = {
  coRun: { icon: <GroupWorkIcon sx={{ color: '#1976d2' }} />, label: 'Co-run', color: '#1976d2' },
  slotRestriction: { icon: <ScheduleIcon sx={{ color: '#f7971e' }} />, label: 'Slot Restriction', color: '#f7971e' },
  loadLimit: { icon: <SpeedIcon sx={{ color: '#7b2ff2' }} />, label: 'Load Limit', color: '#7b2ff2' },
  phaseWindow: { icon: <ScheduleIcon sx={{ color: '#43cea2' }} />, label: 'Phase Window', color: '#43cea2' },
  patternMatch: { icon: <PatternIcon sx={{ color: '#009688' }} />, label: 'Pattern Match', color: '#009688' },
};

const RuleBuilder: React.FC<RuleBuilderProps> = ({ taskIds }) => {
  const { clients, workers, tasks, weights, rules, setRules } = useWorkflow();
  // Co-run state
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  // Slot-restriction state
  const [slotGroup, setSlotGroup] = useState('');
  const [minCommonSlots, setMinCommonSlots] = useState<number | ''>('');
  // Load-limit state
  const [loadWorkerGroup, setLoadWorkerGroup] = useState('');
  const [maxSlotsPerPhase, setMaxSlotsPerPhase] = useState<number | ''>('');
  // Phase-window state
  const [phaseTask, setPhaseTask] = useState('');
  const [allowedPhases, setAllowedPhases] = useState<string>('');
  // Pattern-match state
  const [patternRegex, setPatternRegex] = useState('');
  const [patternTemplate, setPatternTemplate] = useState('');
  const [patternParams, setPatternParams] = useState('');
  // Precedence override (priority)
  const [priority, setPriority] = useState<number | ''>('');
  // AI features
  const [nlRule, setNlRule] = useState('');
  const [suggestedRules, setSuggestedRules] = useState<SuggestedRule[]>([]);
  const [pendingRule, setPendingRule] = useState<Rule | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  // UI state for advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasRequestedSuggestions, setHasRequestedSuggestions] = useState(false);

  // Add Co-run rule
  const handleAddCoRunRule = () => {
    if (selectedTasks.length < 2) return;
    setRules([
      ...rules,
      { type: 'coRun' as const, tasks: selectedTasks, ...(priority !== '' ? { priority: Number(priority) } : {}) },
    ]);
    setSelectedTasks([]);
    setPriority('');
  };

  // Add Slot-restriction rule
  const handleAddSlotRestrictionRule = () => {
    if (!slotGroup || minCommonSlots === '' || isNaN(Number(minCommonSlots))) return;
    setRules([
      ...rules,
      { type: 'slotRestriction' as const, group: slotGroup, minCommonSlots: Number(minCommonSlots), ...(priority !== '' ? { priority: Number(priority) } : {}) },
    ]);
    setSlotGroup('');
    setMinCommonSlots('');
    setPriority('');
  };

  // Add Load-limit rule
  const handleAddLoadLimitRule = () => {
    if (!loadWorkerGroup || maxSlotsPerPhase === '' || isNaN(Number(maxSlotsPerPhase))) return;
    setRules([
      ...rules,
      { type: 'loadLimit' as const, workerGroup: loadWorkerGroup, maxSlotsPerPhase: Number(maxSlotsPerPhase), ...(priority !== '' ? { priority: Number(priority) } : {}) },
    ]);
    setLoadWorkerGroup('');
    setMaxSlotsPerPhase('');
    setPriority('');
  };

  // Add Phase-window rule
  const handleAddPhaseWindowRule = () => {
    if (!phaseTask || !allowedPhases) return;
    const phases = allowedPhases
      .split(',')
      .map(p => Number(p.trim()))
      .filter(p => !isNaN(p));
    if (phases.length === 0) return;
    setRules([
      ...rules,
      { type: 'phaseWindow' as const, task: phaseTask, allowedPhases: phases, ...(priority !== '' ? { priority: Number(priority) } : {}) },
    ]);
    setPhaseTask('');
    setAllowedPhases('');
    setPriority('');
  };

  // Add Pattern-match rule
  const handleAddPatternMatchRule = () => {
    if (!patternRegex || !patternTemplate) return;
    setRules([
      ...rules,
      { type: 'patternMatch' as const, regex: patternRegex, template: patternTemplate, parameters: patternParams, ...(priority !== '' ? { priority: Number(priority) } : {}) },
    ]);
    setPatternRegex('');
    setPatternTemplate('');
    setPatternParams('');
    setPriority('');
  };

  // Delete rule
  const handleDeleteRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  // Download rules as JSON (rules only)
  const handleDownloadJSON = () => {
    const json = JSON.stringify(rules, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // AI: Natural language to rule
  const handleAddNlRule = async () => {
    if (!nlRule.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai-to-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlRule, context: { taskIds } }),
      });
      if (!response.ok) {
        throw new Error('Failed to get rule from AI');
      }
      const data = await response.json();

      // Handle Cohere API response (direct rule object or error)
      if (data.error) {
        alert('AI Error: ' + (data.details || data.error));
        return;
      }
      setRules([...rules, data]);
      setNlRule('');
    } catch (err) {
      alert('Failed to generate rule from AI. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Rule recommendations (data-driven)
  const handleGetSuggestions = () => {
    setHasRequestedSuggestions(true);
    console.log('=== DEBUG: Starting suggestions generation ===');
    console.log('Clients:', clients);
    console.log('Workers:', workers);
    console.log('Tasks:', tasks);
    console.log('Clients length:', clients.length);
    console.log('Workers length:', workers.length);
    console.log('Tasks length:', tasks.length);
    
    // --- Co-run Suggestion: Find task pairs often requested together ---
    const taskPairs: Record<string, number> = {};
    clients.forEach(client => {
      const taskList = (client.RequestedTaskIDs || '').split(',').map((t: string) => t.trim()).filter(Boolean);
      console.log(`Client ${client.ClientID} tasks:`, taskList);
      for (let i = 0; i < taskList.length; i++) {
        for (let j = i + 1; j < taskList.length; j++) {
          const key = [taskList[i], taskList[j]].sort().join(',');
          taskPairs[key] = (taskPairs[key] || 0) + 1;
        }
      }
    });
    console.log('Task pairs found:', taskPairs);
    const coRunSuggestions = Object.entries(taskPairs)
      .filter(([_, count]) => count >= 2)
      .map(([pair]) => {
        const tasks = pair.split(',');
        return {
          rule: { type: 'coRun' as const, tasks },
          description: `Tasks ${tasks.join(' and ')} are often requested together. Add a Co-run rule?`
        };
      });
    console.log('Co-run suggestions:', coRunSuggestions);

    // --- Load-limit Suggestion: Worker groups with high average load ---
    const groupLoads: Record<string, number[]> = {};
    workers.forEach(w => {
      if (!groupLoads[w.WorkerGroup]) groupLoads[w.WorkerGroup] = [];
      groupLoads[w.WorkerGroup].push(Number(w.MaxLoadPerPhase || 0));
    });
    console.log('Group loads:', groupLoads);
    const loadLimitSuggestions = Object.entries(groupLoads)
      .filter(([_, loads]) => loads.length > 0 && (loads.reduce((a, b) => a + b, 0) / loads.length) > 2)
      .map(([group]) => ({
        rule: { type: 'loadLimit' as const, workerGroup: group, maxSlotsPerPhase: 2 },
        description: `Worker group ${group} has high average load. Set a Load-limit?`
      }));
    console.log('Load-limit suggestions:', loadLimitSuggestions);

    // --- High Priority Client Suggestion ---
    const highPriorityClient = clients.reduce((max, c) => (Number(c.PriorityLevel) > Number(max.PriorityLevel) ? c : max), clients[0] || {});
    console.log('High priority client:', highPriorityClient);
    const highPrioritySuggestion = highPriorityClient && highPriorityClient.ClientID
      ? [{
          rule: { type: 'phaseWindow' as const, task: (highPriorityClient.RequestedTaskIDs || '').split(',')[0], allowedPhases: [1] },
          description: `Client ${highPriorityClient.ClientID} has the highest priority. Move their task earlier?`
        }]
      : [];
    console.log('High priority suggestions:', highPrioritySuggestion);

    // --- Combine all suggestions ---
    const suggestions = [
      ...coRunSuggestions,
      ...loadLimitSuggestions,
      ...highPrioritySuggestion
    ];
    console.log('Final suggestions:', suggestions);
    setSuggestedRules(suggestions);
  };

  const handleAcceptSuggestion = (idx: number) => {
    setRules([...rules, suggestedRules[idx].rule]);
    setSuggestedRules(suggestedRules.filter((_, i) => i !== idx));
  };
  const handleIgnoreSuggestion = (idx: number) => {
    setSuggestedRules(suggestedRules.filter((_, i) => i !== idx));
  };

  const getRuleDescription = (rule: Rule): string => {
    switch (rule.type) {
      case 'coRun':
        return `[Co-run] Tasks: ${(rule as CoRunRule).tasks.join(', ')}${rule.priority !== undefined ? ` | Priority: ${rule.priority}` : ''}`;
      case 'slotRestriction':
        return `[Slot-restriction] Group: ${(rule as SlotRestrictionRule).group}, minCommonSlots: ${(rule as SlotRestrictionRule).minCommonSlots}${rule.priority !== undefined ? ` | Priority: ${rule.priority}` : ''}`;
      case 'loadLimit':
        return `[Load-limit] WorkerGroup: ${(rule as LoadLimitRule).workerGroup}, maxSlotsPerPhase: ${(rule as LoadLimitRule).maxSlotsPerPhase}${rule.priority !== undefined ? ` | Priority: ${rule.priority}` : ''}`;
      case 'phaseWindow':
        return `[Phase-window] Task: ${(rule as PhaseWindowRule).task}, Allowed Phases: ${(rule as PhaseWindowRule).allowedPhases.join(', ')}${rule.priority !== undefined ? ` | Priority: ${rule.priority}` : ''}`;
      case 'patternMatch':
        return `[Pattern-match] Regex: ${(rule as PatternMatchRule).regex}, Template: ${(rule as PatternMatchRule).template}, Params: ${(rule as PatternMatchRule).parameters}${rule.priority !== undefined ? ` | Priority: ${rule.priority}` : ''}`;
      default:
        return 'Unknown rule';
    }
  };

  const grouped = {
    coRun: rules.filter(r => r.type === 'coRun'),
    loadLimit: rules.filter(r => r.type === 'loadLimit'),
    phaseWindow: rules.filter(r => r.type === 'phaseWindow'),
    // ...other types
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h1 style={{ textAlign: 'center', width: '100%', marginBottom: 32, fontWeight: 800, color: '#1976d2', letterSpacing: 1 }}>Rule Builder</h1>
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {ruleTypeMeta.coRun.icon}
          <Typography variant="h6" sx={{ fontWeight: 700, color: ruleTypeMeta.coRun.color }}>
            {ruleTypeMeta.coRun.label} Rule
          </Typography>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Tooltip title="Select two or more tasks to co-run" arrow>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="coRun-tasks-label">Task IDs</InputLabel>
                <Select
                  labelId="coRun-tasks-label"
                  multiple
                  value={selectedTasks}
                  onChange={e => setSelectedTasks(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Task IDs" />}
                  renderValue={selected => (selected as string[]).join(', ')}
                >
                  {taskIds.map(id => (
                    <MenuItem key={id} value={id}>
                      <Checkbox checked={selectedTasks.indexOf(id) > -1} />
                      {id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={3}>
            <Tooltip title="Optional: Set a priority for this rule" arrow>
              <TextField
                label="Priority (optional)"
                type="number"
                value={priority}
                onChange={e => setPriority(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ height: 40, fontWeight: 700, borderRadius: 2 }}
              disabled={selectedTasks.length < 2}
              onClick={handleAddCoRunRule}
            >
              Add Co-Run Rule
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Slot Restriction Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {ruleTypeMeta.slotRestriction.icon}
          <Typography variant="h6" sx={{ fontWeight: 700, color: ruleTypeMeta.slotRestriction.color }}>
            {ruleTypeMeta.slotRestriction.label} Rule
          </Typography>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Tooltip title="Enter group name (e.g., GroupA)" arrow>
              <TextField
                label="Group"
                value={slotGroup}
                onChange={e => setSlotGroup(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Minimum number of common slots" arrow>
              <TextField
                label="Min Common Slots"
                type="number"
                value={minCommonSlots}
                onChange={e => setMinCommonSlots(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Optional: Set a priority for this rule" arrow>
              <TextField
                label="Priority (optional)"
                type="number"
                value={priority}
                onChange={e => setPriority(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="warning"
              fullWidth
              sx={{ height: 40, fontWeight: 700, borderRadius: 2 }}
              disabled={!slotGroup || minCommonSlots === ''}
              onClick={handleAddSlotRestrictionRule}
            >
              Add Slot Restriction
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Load Limit Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {ruleTypeMeta.loadLimit.icon}
          <Typography variant="h6" sx={{ fontWeight: 700, color: ruleTypeMeta.loadLimit.color }}>
            {ruleTypeMeta.loadLimit.label} Rule
          </Typography>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Tooltip title="Enter worker group name" arrow>
              <TextField
                label="Worker Group"
                value={loadWorkerGroup}
                onChange={e => setLoadWorkerGroup(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Max slots per phase" arrow>
              <TextField
                label="Max Slots/Phase"
                type="number"
                value={maxSlotsPerPhase}
                onChange={e => setMaxSlotsPerPhase(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Optional: Set a priority for this rule" arrow>
              <TextField
                label="Priority (optional)"
                type="number"
                value={priority}
                onChange={e => setPriority(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ height: 40, fontWeight: 700, borderRadius: 2 }}
              disabled={!loadWorkerGroup || maxSlotsPerPhase === ''}
              onClick={handleAddLoadLimitRule}
            >
              Add Load Limit
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Phase Window Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {ruleTypeMeta.phaseWindow.icon}
          <Typography variant="h6" sx={{ fontWeight: 700, color: ruleTypeMeta.phaseWindow.color }}>
            {ruleTypeMeta.phaseWindow.label} Rule
          </Typography>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Tooltip title="Select a task" arrow>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="phase-task-label">Task</InputLabel>
                <Select
                  labelId="phase-task-label"
                  value={phaseTask}
                  onChange={e => setPhaseTask(e.target.value)}
                  input={<OutlinedInput label="Task" />}
                >
                  {taskIds.map(id => (
                    <MenuItem key={id} value={id}>{id}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Allowed phases (comma-separated)" arrow>
              <TextField
                label="Allowed Phases"
                value={allowedPhases}
                onChange={e => setAllowedPhases(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. 1,2,3"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Optional: Set a priority for this rule" arrow>
              <TextField
                label="Priority (optional)"
                type="number"
                value={priority}
                onChange={e => setPriority(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ height: 40, fontWeight: 700, borderRadius: 2 }}
              disabled={!phaseTask || !allowedPhases}
              onClick={handleAddPhaseWindowRule}
            >
              Add Phase Window
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Pattern Match Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {ruleTypeMeta.patternMatch.icon}
          <Typography variant="h6" sx={{ fontWeight: 700, color: ruleTypeMeta.patternMatch.color }}>
            {ruleTypeMeta.patternMatch.label} Rule
          </Typography>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Tooltip title="Regex pattern" arrow>
              <TextField
                label="Regex"
                value={patternRegex}
                onChange={e => setPatternRegex(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. ^T[0-9]+$"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={3}>
            <Tooltip title="Template string" arrow>
              <TextField
                label="Template"
                value={patternTemplate}
                onChange={e => setPatternTemplate(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. Task {id}"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={3}>
            <Tooltip title="Parameters (comma-separated)" arrow>
              <TextField
                label="Parameters"
                value={patternParams}
                onChange={e => setPatternParams(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. id,phase"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Optional: Set a priority for this rule" arrow>
              <TextField
                label="Priority (optional)"
                type="number"
                value={priority}
                onChange={e => setPriority(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="contained"
              color="info"
              fullWidth
              sx={{ height: 40, fontWeight: 700, borderRadius: 2 }}
              disabled={!patternRegex || !patternTemplate}
              onClick={handleAddPatternMatchRule}
            >
              Add Pattern
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* AI-Powered Rule Creation Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <AutoAwesomeIcon sx={{ color: '#43cea2' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#43cea2' }}>
            AI-Powered Rule Creation
          </Typography>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={10}>
            <Tooltip title="Describe your rule in natural language (e.g., 'Make T12 and T14 always run together')" arrow>
              <TextField
                label="Describe your rule"
                value={nlRule}
                onChange={e => setNlRule(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. Make T12 and T14 always run together"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ height: 40, fontWeight: 700, borderRadius: 2 }}
              disabled={!nlRule.trim() || aiLoading}
              onClick={handleAddNlRule}
              startIcon={aiLoading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            >
              Add via AI
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Rule Recommendations Button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <Button
          variant="contained"
          color="info"
          sx={{ fontWeight: 700, borderRadius: 2 }}
          onClick={handleGetSuggestions}
        >
          Get Rule Recommendations
        </Button>
      </Box>

      {/* Suggested Rules Section */}
      {suggestedRules.length > 0 && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'green', fontWeight: 600 }}>
              AI found rule recommendations for your data!
            </Typography>
          </Box>
          <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', bgcolor: '#f8f9fa', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1976d2' }}>
              AI Rule Suggestions
            </Typography>
            <Stack spacing={2}>
              {suggestedRules.map((suggestion, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 2.5,
                    border: '1px solid #e0e0e0',
                    borderLeft: '5px solid #1976d2',
                    borderRadius: 3,
                    bgcolor: '#fff',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.07)',
                    mb: 1.5,
                    minHeight: 64,
                  }}
                >
                  <Box sx={{ mt: 0.5 }}>
                    <AutoAwesomeIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600, color: '#23293a', fontSize: 16 }}>
                      {suggestion.description || JSON.stringify(suggestion, null, 2)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ borderRadius: 2, fontWeight: 500, minWidth: 80, fontSize: 13, py: 0.5, px: 1.5 }}
                        onClick={() => handleIgnoreSuggestion(idx)}
                      >
                        Ignore
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ borderRadius: 2, fontWeight: 600, minWidth: 80, fontSize: 13, py: 0.5, px: 1.5, boxShadow: 'none' }}
                        onClick={() => handleAcceptSuggestion(idx)}
                      >
                        Accept
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </>
      )}

      {/* Rule Summary Table */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
          Current Rules
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: '#b0b8c1' }}>
                    No rules added yet.
                  </TableCell>
                </TableRow>
              )}
              {rules.map((rule, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {ruleTypeMeta[rule.type as keyof typeof ruleTypeMeta]?.icon}
                      <Chip label={ruleTypeMeta[rule.type as keyof typeof ruleTypeMeta]?.label} size="small" sx={{ bgcolor: ruleTypeMeta[rule.type as keyof typeof ruleTypeMeta]?.color, color: '#fff', fontWeight: 700 }} />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{JSON.stringify(rule, null, 2)}</Typography>
                  </TableCell>
                  <TableCell>{rule.priority ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete rule" arrow>
                      <IconButton onClick={() => handleDeleteRule(idx)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadJSON}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
           Generate Rules Config
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RuleBuilder;
