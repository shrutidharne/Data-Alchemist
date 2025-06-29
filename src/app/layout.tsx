import React from 'react';
import ThemeRegistry from '../components/ThemeRegistry';
import { WorkflowProvider } from '../components/WorkflowContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <WorkflowProvider>
            {children}
          </WorkflowProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
} 