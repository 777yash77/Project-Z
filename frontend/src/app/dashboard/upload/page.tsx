'use client';

import { useState } from 'react';
import axios from 'axios';
import { UploadCloud } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please choose a CSV file first');
      return;
    }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8080/api/employees/upload-csv', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message || 'Upload successful');
      setFile(null);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/20">
        <h1 className="text-3xl font-semibold text-white">Bulk Upload</h1>
        <p className="mt-2 text-sm text-slate-400">Import employee CSV files and automatically persist risk-scored data.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
          <div
            className={`group flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[1.75rem] border-2 border-dashed p-8 text-center transition ${dragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 bg-slate-950/80 hover:border-cyan-400'}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <UploadCloud size={42} className="text-cyan-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Drag & drop your CSV</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-400">Supported format: .csv with columns <span className="font-medium text-slate-200">name, age, salary, yearsAtCompany, performanceRating, department</span>.</p>
            </div>
            <label className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
              Browse file
              <input type="file" accept=".csv" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {file ? (
                <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-slate-200">
                  <p className="text-sm text-slate-400">File ready to upload</p>
                  <p className="mt-1 text-base font-medium">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No file selected yet.</p>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Uploading CSV...' : 'Upload and save'}
            </button>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300 ring-1 ring-slate-800">
            <p className="font-semibold text-white">Upload benefits</p>
            <ul className="mt-3 space-y-2">
              <li>• Saves all valid records directly to the backend.</li>
              <li>• Recalculates retention risk for every imported row.</li>
              <li>• Works with both new and existing employees.</li>
            </ul>
          </div>
          {message && <p className="mt-4 rounded-3xl bg-cyan-500/10 p-4 text-sm text-cyan-200">{message}</p>}
        </section>

        <aside className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="rounded-3xl bg-gradient-to-br from-violet-500/15 to-cyan-500/10 p-5 text-slate-100">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Upload guide</p>
            <h2 className="mt-3 text-xl font-semibold text-white">CSV import helper</h2>
            <p className="mt-3 text-sm text-slate-300">Drop a CSV to stage your employee dataset, then click upload to persist all rows with risk score calculation.</p>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-950/80 p-4 ring-1 ring-slate-800">
              <p className="font-medium text-white">Required CSV fields</p>
              <p className="mt-3 text-sm text-slate-300">name, age, salary, yearsAtCompany, performanceRating, department</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4 ring-1 ring-slate-800">
              <p className="font-medium text-white">Pro tips</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>• Keep salaries numeric and departments consistent.</li>
                <li>• Use one row per employee for reliable import.</li>
                <li>• Check Workbench for imported records after upload.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
