'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught by root error boundary:', error);
  }, [error]);

  return (
    <html lang="en" style={{ height: '100%' }}>
      <body
        style={{
          height: '100%',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B1020',
          color: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '1rem',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: '#11172A',
            border: '1px solid #1E293B',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg
              style={{ width: '1.75rem', height: '1.75rem' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: '0.5rem',
            }}
          >
            Application Error
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#94A3B8',
              lineHeight: '1.5',
              marginBottom: '1.5rem',
            }}
          >
            A critical error occurred while loading White Board SAT.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.75rem',
                backgroundColor: '#0D918A',
                color: '#FFFFFF',
                fontWeight: 500,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.assign('/');
                }
              }}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.75rem',
                backgroundColor: '#1E293B',
                color: '#E2E8F0',
                fontWeight: 500,
                fontSize: '0.875rem',
                border: '1px solid #334155',
                cursor: 'pointer',
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
