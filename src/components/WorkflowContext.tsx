"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type WorkflowContextType = {
  clients: any[];
  setClients: (c: any[]) => void;
  workers: any[];
  setWorkers: (w: any[]) => void;
  tasks: any[];
  setTasks: (t: any[]) => void;
  weights: {
    priorityLevel: number;
    taskFulfillment: number;
    fairness: number;
  };
  setWeights: (w: { priorityLevel: number; taskFulfillment: number; fairness: number }) => void;
  rules: any[];
  setRules: (r: any[]) => void;
};

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [weights, setWeights] = useState({
    priorityLevel: 33,
    taskFulfillment: 34,
    fairness: 33,
  });
  const [rules, setRules] = useState<any[]>([]);

  return (
    <WorkflowContext.Provider value={{
      clients, setClients,
      workers, setWorkers,
      tasks, setTasks,
      weights, setWeights,
      rules, setRules,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used within a WorkflowProvider");
  return ctx;
} 