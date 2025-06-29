'use client';
import React from 'react';
import RuleBuilder from '../../components/RuleBuilder';
import WorkflowStepper from '../../components/WorkflowStepper';
import Link from 'next/link';
import { Button } from '@mui/material';
import { useWorkflow } from '../../components/WorkflowContext';

export default function RulesPage() {
  const { tasks } = useWorkflow();
  
  // Extract task IDs from the tasks array
  const taskIds = tasks.map(task => task.TaskID || task.taskID || task.id || task.Id).filter(Boolean);

  return (
    <div style={{ padding: 32 }}>
      <WorkflowStepper currentStep={1} />
      <h1>Rule Builder</h1>
      <RuleBuilder taskIds={taskIds} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <Link href="/">
          <Button variant="outlined" color="primary" size="large">Back</Button>
        </Link>
        <Link href="/priority">
          <Button variant="contained" color="primary" size="large">Next</Button>
        </Link>
      </div>
    </div>
  );
}