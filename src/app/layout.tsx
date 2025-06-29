import React from 'react';
import ThemeRegistry from '../components/ThemeRegistry';
import Link from 'next/link';
import { WorkflowProvider } from '../components/WorkflowContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <WorkflowProvider>
            <header style={{
              background: 'linear-gradient(90deg, #23293a 60%, #22304a 100%)',
              padding: '36px 0 28px 0',
              marginBottom: 32,
              boxShadow: '0 4px 24px rgba(25, 118, 210, 0.13)',
            }}>
              <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 32px',
                minHeight: 100,
              }}>
                {/* Left: DIGITALYZ */}
                <div style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#b39ddb',
                  letterSpacing: 2,
                  fontFamily: 'Inter, Roboto, Arial, sans-serif',
                  opacity: 0.85,
                  minWidth: 120,
                }}>
                  DIGITALYZ
                </div>
                {/* Center: Data Alchemist + subtitle + icon */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      background: 'linear-gradient(135deg, #1976d2 60%, #43cea2 100%)',
                      borderRadius: '50%',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                    }}>
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3.01 5.74l-.01.01A7.01 7.01 0 0 1 12 22a7 7 0 0 1-7-7c0-2.38 1.19-4.47 3.01-5.74l.01-.01A7.01 7.01 0 0 1 12 2Zm0 2C8.13 4 5 7.13 5 11c0 3.87 3.13 7 7 7s7-3.13 7-7c0-3.87-3.13-7-7-7Zm0 3a4 4 0 0 1 4 4c0 1.38-.72 2.59-1.81 3.29l-.01.01A4.01 4.01 0 0 1 12 17a4 4 0 0 1-4-4c0-1.38.72-2.59 1.81-3.29l.01-.01A4.01 4.01 0 0 1 12 7Zm0 2c-1.1 0-2 .9-2 2 0 .74.4 1.38 1 1.73V13h2v-2.27c.6-.35 1-.99 1-1.73 0-1.1-.9-2-2-2Z"/></svg>
                    </span>
                    <span style={{
                      fontWeight: 900,
                      fontSize: 38,
                      color: '#2196f3',
                      letterSpacing: 1,
                      fontFamily: 'Inter, Roboto, Arial, sans-serif',
                      textShadow: '0 2px 8px rgba(25, 118, 210, 0.10)'
                    }}>
                      Data Alchemist
                    </span>
                  </div>
                  <span style={{
                    fontWeight: 500,
                    fontSize: 18,
                    color: '#b0b8c1',
                    marginTop: 4,
                    letterSpacing: 0.5,
                    fontFamily: 'Inter, Roboto, Arial, sans-serif',
                    textAlign: 'center',
                  }}>
                    AI-Powered Resource Allocation Configurator
                  </span>
                </div>
                {/* Right: AI ENABLED pill */}
                <div style={{
                  minWidth: 120,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}>
                  <span style={{
                    background: 'linear-gradient(90deg, #43cea2 0%, #1976d2 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    borderRadius: 16,
                    padding: '6px 20px',
                    letterSpacing: 1,
                    boxShadow: '0 2px 8px rgba(67, 206, 162, 0.13)',
                  }}>
                    AI ENABLED
                  </span>
                </div>
              </nav>
            </header>
            {children}
          </WorkflowProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
} 