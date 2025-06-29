import React from 'react';
import RuleBuilder from '../../components/RuleBuilder';
import WorkflowStepper from '../../components/WorkflowStepper';
import Link from 'next/link';
import { Button } from '@mui/material';

// Example: Replace with your real task IDs from context or state if available
const taskIds = ["T1", "T2", "T3"];

export default function RulesPage() {
  return (
    <div style={{ padding: 32 }}>
      <WorkflowStepper currentStep={1} />
      {/* <h1>Rule Builder</h1> */}
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