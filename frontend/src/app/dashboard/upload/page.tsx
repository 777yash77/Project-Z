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
            className={`group flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${
              dragging
                ? 'border-green-400 bg-green-500/8 shadow-[0_0_30px_rgba(0,255,136,0.1)]'
                : 'border-green-500/15 bg-black/30 hover:border-green-500/35 hover:bg-green-500/4'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border transition ${dragging ? 'border-green-400/40 bg-green-500/15' : 'border-green-500/15 bg-black/40'}`}>
              <UploadCloud size={28} className={dragging ? 'text-green-400' : 'text-green-500/40'} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Drag & drop your CSV</h2>
              <p className="mt-1.5 max-w-xs text-xs text-green-100/30">
                Required columns: <span className="font-medium text-green-400/60">name, age, salary, yearsAtCompany, performanceRating, department</span>
              </p>
            </div>
            <label className="cursor-pointer rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-400 transition hover:bg-green-500/15 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)]">
              Browse file
              <input id="csv-file-input" type="file" accept=".csv" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          {/* File info */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {file ? (
              <div className="flex items-center gap-3 rounded-xl border border-green-500/15 bg-black/40 px-4 py-3">
                <FileText size={18} className="text-green-400" />
                <div>
                  <p className="text-sm font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-green-100/30">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setFile(null)} className="ml-2 text-green-100/30 hover:text-white"><X size={14} /></button>
              </div>
            ) : (
              <p className="text-sm text-green-100/25">No file selected yet.</p>
            )}
            <button
              id="upload-submit-btn"
              onClick={handleUpload}
              disabled={uploading || !file}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-green-400 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UploadCloud size={15} />
              {uploading ? 'Uploading...' : 'Upload & Save'}
            </button>
          </div>

          {/* Status message */}
          {message && (
            <div className={`mt-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${success ? 'border-green-500/20 bg-green-500/8 text-green-300' : 'border-red-500/20 bg-red-500/8 text-red-300'}`}>
              <div className="flex items-center gap-2">
                {success && <CheckCircle2 size={16} className="text-green-400" />}
                {message}
              </div>
              {success && (
                <a
                  href="/dashboard/employees"
                  className="inline-flex items-center gap-1 text-xs font-bold text-green-400 underline hover:text-green-300"
                >
                  View in Employee Directory &rarr;
                </a>
              )}
            </div>
          )}
        </section>

        {/* Guide */}
        <aside className="rounded-2xl border border-green-500/10 bg-[#060e09] p-6">
          <div className="rounded-xl border border-green-500/12 bg-green-500/5 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-green-400/50">Upload Guide</p>
            <h2 className="mt-3 text-lg font-bold text-white">CSV Import Helper</h2>
            <p className="mt-2 text-xs leading-relaxed text-green-100/35">
              Drop a CSV to stage your employee dataset, then click upload to persist all rows with automatic risk score calculation.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-green-500/8 bg-black/30 p-4">
              <p className="text-sm font-semibold text-white">Required CSV fields</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['name', 'age', 'salary', 'yearsAtCompany', 'performanceRating', 'department'].map((f) => (
                  <span key={f} className="rounded-lg bg-green-500/10 px-2.5 py-1 text-xs font-mono text-green-400/70">{f}</span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-green-500/8 bg-black/30 p-4">
              <p className="text-sm font-semibold text-white">Pro Tips</p>
              <ul className="mt-3 space-y-2">
                {[
                  'Keep salaries numeric (no $ signs).',
                  'Use consistent department names.',
                  'One row per employee for best results.',
                  'Performance rating should be 1–10.',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-green-100/35">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500/50" />
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
