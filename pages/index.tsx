import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('html');

  const handleValidate = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('format', format);

      const response = await fetch(`/api/validate?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Validation failed');
      }

      if (format === 'html') {
        const html = await response.text();
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        }
      } else if (format === 'text') {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `validation-report-${new Date().toISOString()}.txt`;
        a.click();
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `validation-report-${new Date().toISOString()}.json`;
        a.click();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Marketplace Transaction Validator</title>
        <meta name="description" content="Validate Atlassian Marketplace transactions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>Marketplace Transaction Validator</h1>
          <p style={styles.description}>
            Validate Atlassian Marketplace transactions for correct pricing, discount explanations, and partner cuts.
          </p>

          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Date (optional)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>End Date (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Report Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={styles.select}
              >
                <option value="html">HTML (View in Browser)</option>
                <option value="json">JSON (Download)</option>
                <option value="text">Text (Download)</option>
              </select>
            </div>

            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            <button
              onClick={handleValidate}
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? 'Validating...' : 'Validate Transactions'}
            </button>
          </div>

          <div style={styles.apiDocs}>
            <h2 style={styles.subtitle}>API Usage</h2>
            <p style={styles.apiDescription}>
              You can also call the validation API directly:
            </p>
            <pre style={styles.code}>
              GET /api/validate?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=json|html|text
            </pre>
            <p style={styles.apiDescription}>
              Check API health:
            </p>
            <pre style={styles.code}>
              GET /api/health
            </pre>
          </div>
        </div>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    padding: '4rem 1rem',
    background: 'linear-gradient(to bottom, #f5f7fa, #e8eef5)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#0052CC',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  description: {
    fontSize: '1.125rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '3rem',
  },
  form: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    background: 'white',
  },
  button: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'white',
    background: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    padding: '1rem',
    marginBottom: '1rem',
    background: '#FFEBE6',
    color: '#DE350B',
    borderRadius: '4px',
    borderLeft: '4px solid #DE350B',
  },
  apiDocs: {
    marginTop: '3rem',
    padding: '2rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
  },
  apiDescription: {
    color: '#666',
    marginBottom: '0.5rem',
  },
  code: {
    background: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflow: 'auto',
    marginBottom: '1rem',
  },
};
