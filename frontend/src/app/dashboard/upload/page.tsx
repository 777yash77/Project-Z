'use client';

import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle2, X } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleUpload = async () => {
    if (!file) { setMessage('Please choose a CSV file first.'); return; }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setMessage('');
    setSuccess(false);
    try {
      const response = await axios.post('http://localhost:8080/api/employees/upload-csv', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message || 'Upload successful');
      setSuccess(true);
      setFile(null);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Upload failed');
      setSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) setFile(event.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Data Import</p>
        <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Bulk CSV Upload</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Import employee CSV files and automatically persist risk-scored data.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        {/* Upload Zone */}
        <section className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <div
            id="csv-drop-zone"
            className="group flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer"
            style={{
              borderColor: dragging ? 'var(--accent)' : 'var(--border-subtle)',
              backgroundColor: dragging ? 'var(--accent-glow)' : 'var(--bg-card)',
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border transition" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
              <UploadCloud size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Drag & drop your CSV</h2>
              <p className="mt-1.5 max-w-xs text-xs" style={{ color: 'var(--text-muted)' }}>
                Required columns: <span className="font-medium" style={{ color: 'var(--accent)' }}>name, age, salary, yearsAtCompany, performanceRating, department</span>
              </p>
            </div>
            <label className="cursor-pointer rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:opacity-90" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--accent)' }}>
              Browse file
              <input id="csv-file-input" type="file" accept=".csv" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          {/* File info */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {file ? (
              <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <FileText size={18} style={{ color: 'var(--accent)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setFile(null)} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No file selected yet.</p>
            )}
            <button
              id="upload-submit-btn"
              onClick={handleUpload}
              disabled={uploading || !file}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <UploadCloud size={15} />
              {uploading ? 'Uploading...' : 'Upload & Save'}
            </button>
          </div>

          {/* Status message */}
          {message && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: success ? 'var(--accent)' : '#ef4444' }}>
              <div className="flex items-center gap-2">
                {success && <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />}
                {message}
              </div>
              {success && (
                <a
                  href="/dashboard/employees"
                  className="inline-flex items-center gap-1 text-xs font-bold underline"
                  style={{ color: 'var(--accent)' }}
                >
                  View in Employee Directory &rarr;
                </a>
              )}
            </div>
          )}
        </section>

        {/* Guide */}
        <aside className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Upload Guide</p>
            <h2 className="mt-3 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>CSV Import Helper</h2>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Drop a CSV to stage your employee dataset, then click upload to persist all rows with automatic risk score calculation.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Required CSV fields</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['name', 'age', 'salary', 'yearsAtCompany', 'performanceRating', 'department'].map((f) => (
                  <span key={f} className="rounded-lg border px-2.5 py-1 text-xs font-mono" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--accent)' }}>{f}</span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pro Tips</p>
              <ul className="mt-3 space-y-2">
                {[
                  'Keep salaries numeric (no $ signs).',
                  'Use consistent department names.',
                  'One row per employee for best results.',
                  'Performance rating should be 1–10.',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
