'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Filter, ArrowRightLeft, X } from 'lucide-react';
import { createEmployee, createTradeListing, deleteEmployee, fetchEmployees, updateEmployee } from '../api';

interface Employee {
  id: number;
  name: string;
  age: number;
  salary: string;
  yearsAtCompany: number;
  performanceRating: number;
  department: string;
  riskScore: number;
  riskLevel: string;
}

const emptyForm = { name: '', age: '', salary: '', yearsAtCompany: '', performanceRating: '', department: '' };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const loadEmployees = () => {
    fetchEmployees().then((res) => setEmployees(Array.isArray(res?.data) ? res.data : [])).catch(() => setEmployees([]));
  };

  useEffect(() => { loadEmployees(); }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'All' || e.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [employees, searchQuery, riskFilter]);

  const totalEmployees = employees.length;
  const avgRisk = employees.length ? (employees.reduce((sum, e) => sum + e.riskScore, 0) / employees.length).toFixed(2) : '0.00';
  const avgRating = employees.length ? (employees.reduce((sum, e) => sum + e.performanceRating, 0) / employees.length).toFixed(1) : '0.0';

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (e: Employee) => {
    setEditingId(e.id);
    setForm({ name: e.name, age: String(e.age), salary: e.salary, yearsAtCompany: String(e.yearsAtCompany), performanceRating: String(e.performanceRating), department: e.department });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, age: Number(form.age), salary: form.salary, yearsAtCompany: Number(form.yearsAtCompany), performanceRating: Number(form.performanceRating), department: form.department };
    try {
      if (editingId) { await updateEmployee(editingId, payload); } else { await createEmployee(payload); }
      setShowModal(false);
      setMessage('Employee saved successfully.');
      loadEmployees();
    } catch (error: any) { setMessage(error.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteEmployee(id); setMessage('Employee deleted.'); loadEmployees(); }
    catch { setMessage('Delete failed'); }
  };

  const toggleTrade = async (employee: Employee) => {
    try {
      await createTradeListing({ employeeId: employee.id, commissionPercent: 8, notes: `${employee.name} is available for a trade placement.` });
      setMessage(`${employee.name} is now listed in the trade window.`);
    } catch { setMessage('Trade listing could not be created.'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>HR Directory</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Employee Directory</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Filter, edit, and manage employee risk profiles.</p>
          </div>
          <button
            id="add-employee-btn"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Total Employees', value: totalEmployees },
            { label: 'Average Risk Score', value: avgRisk },
            { label: 'Average Rating', value: avgRating },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        {/* Search & Filter */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border px-4 py-2.5 transition-all shadow-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
            <Search size={15} className="text-green-400" />
            <input
              id="employee-search"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Search by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-all shadow-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
            <Filter size={15} className="text-green-400" />
            <select
              id="risk-filter"
              className="bg-transparent text-sm outline-none cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
            >
              <option value="All" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>All risks</option>
              <option value="High" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>High</option>
              <option value="Medium" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Medium</option>
              <option value="Low" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-green-500/8">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-green-500/8 bg-black/30">
                {['Name', 'Department', 'Risk', 'Salary', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-green-400/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-t border-green-500/5 transition hover:bg-green-500/3">
                  <td className="px-5 py-3.5 font-semibold text-white">{employee.name}</td>
                  <td className="px-5 py-3.5 text-green-100/50">{employee.department}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`w-12 text-xs font-semibold ${employee.riskLevel === 'High' ? 'text-red-400' : employee.riskLevel === 'Medium' ? 'text-amber-400' : 'text-green-400'}`}>
                        {employee.riskLevel}
                      </span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/50">
                        <div
                          className={`h-full rounded-full ${employee.riskLevel === 'High' ? 'bg-red-500' : employee.riskLevel === 'Medium' ? 'bg-amber-400' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, employee.riskScore * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-green-100/50">${Number(employee.salary).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTrade(employee)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/15 bg-green-500/8 px-3 py-1.5 text-xs font-semibold text-green-400 transition hover:bg-green-500/15"
                      >
                        <ArrowRightLeft size={12} /> Trade
                      </button>
                      <button
                        onClick={() => openEdit(employee)}
                        className="rounded-lg border p-1.5 transition hover:opacity-90"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="rounded-lg border p-1.5 transition hover:opacity-90"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: '#ef4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No employees match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>
          {message}
          <button onClick={() => setMessage('')}><X size={14} /></button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative my-auto w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 shadow-2xl" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="mb-6 flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>All entries are risk-scored before persisting.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border p-2 transition hover:opacity-90"
                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              {[
                { label: 'Full Name', placeholder: 'e.g. Michael Chen', key: 'name', type: 'text' },
                { label: 'Age', placeholder: 'e.g. 35', key: 'age', type: 'number' },
                { label: 'Annual Salary ($)', placeholder: 'e.g. 75000', key: 'salary', type: 'text' },
                { label: 'Years at Company', placeholder: 'e.g. 5', key: 'yearsAtCompany', type: 'number' },
                { label: 'Performance Rating (1.0 – 5.0)', placeholder: 'e.g. 4.2', key: 'performanceRating', type: 'number', step: '0.1' },
                { label: 'Department', placeholder: 'e.g. Engineering', key: 'department', type: 'text' },
              ].map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    step={field.step}
                    className="rounded-xl border px-4 py-3 text-sm font-medium outline-none transition"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t mt-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-6 py-2.5 text-sm font-extrabold text-black transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
