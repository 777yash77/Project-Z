'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';

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

const emptyForm = {
  name: '',
  age: '',
  salary: '',
  yearsAtCompany: '',
  performanceRating: '',
  department: '',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const loadEmployees = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/employees', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]));
  };

  useEffect(() => { loadEmployees(); }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || employee.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'All' || employee.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [employees, searchQuery, riskFilter]);

  const totalEmployees = employees.length;
  const avgRisk = employees.length ? (employees.reduce((sum, item) => sum + item.riskScore, 0) / employees.length).toFixed(2) : '0.00';
  const avgRating = employees.length ? (employees.reduce((sum, item) => sum + item.performanceRating, 0) / employees.length).toFixed(1) : '0.0';

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      age: String(employee.age),
      salary: employee.salary,
      yearsAtCompany: String(employee.yearsAtCompany),
      performanceRating: String(employee.performanceRating),
      department: employee.department,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
      name: form.name,
      age: Number(form.age),
      salary: form.salary,
      yearsAtCompany: Number(form.yearsAtCompany),
      performanceRating: Number(form.performanceRating),
      department: form.department,
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/employees/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:8080/api/employees', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      setMessage('Employee saved successfully.');
      loadEmployees();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8080/api/employees/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Employee deleted successfully.');
      loadEmployees();
    } catch (error) {
      setMessage('Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Employee Directory</h1>
            <p className="mt-2 text-sm text-slate-400">Filter, edit, and save employee risk profiles with a polished HR experience.</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110">
            <Plus size={16} /> Add employee
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-950/90 p-4 ring-1 ring-slate-800">
            <p className="text-sm text-slate-400">Total employees</p>
            <p className="mt-3 text-2xl font-semibold text-white">{totalEmployees}</p>
          </div>
          <div className="rounded-3xl bg-slate-950/90 p-4 ring-1 ring-slate-800">
            <p className="text-sm text-slate-400">Average risk score</p>
            <p className="mt-3 text-2xl font-semibold text-white">{avgRisk}</p>
          </div>
          <div className="rounded-3xl bg-slate-950/90 p-4 ring-1 ring-slate-800">
            <p className="text-sm text-slate-400">Average rating</p>
            <p className="mt-3 text-2xl font-semibold text-white">{avgRating}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 rounded-3xl bg-slate-950/90 px-4 py-3">
              <Search size={18} className="text-cyan-400" />
              <input
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Search by name or department"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 rounded-3xl bg-slate-950/90 px-4 py-3">
              <Filter size={18} className="text-amber-400" />
              <select className="bg-transparent text-sm text-slate-100 outline-none" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as any)}>
                <option value="All">All risks</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Risk</th>
                  <th className="px-5 py-4">Salary</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-t border-slate-800 hover:bg-slate-900/80">
                    <td className="px-5 py-4 font-medium text-white">{employee.name}</td>
                    <td className="px-5 py-4 text-slate-300">{employee.department}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{employee.riskLevel}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full ${employee.riskLevel === 'High' ? 'bg-rose-500' : employee.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, employee.riskScore * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">${Number(employee.salary).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(employee)} className="rounded-2xl bg-slate-800 p-2 text-slate-300 transition hover:bg-cyan-500/15">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(employee.id)} className="rounded-2xl bg-slate-800 p-2 text-slate-300 transition hover:bg-rose-500/15">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-5 text-slate-100">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Employee health</p>
            <h2 className="mt-3 text-2xl font-semibold">Save every record</h2>
            <p className="mt-3 text-sm text-slate-300">Manual updates and CSV imports are persisted through the backend API, including risk score calculation for each entry.</p>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-950/80 p-4 ring-1 ring-slate-800">
              <p className="text-sm text-slate-400">Records visible</p>
              <p className="mt-2 text-3xl font-semibold text-white">{filteredEmployees.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4 ring-1 ring-slate-800">
              <p className="text-sm text-slate-400">Quick tips</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>• Use CSV upload for batch imports.</li>
                <li>• Edit any row to re-run risk scoring.</li>
                <li>• Filter by risk level for targeted review.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {message && <div className="rounded-3xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-sm text-cyan-200">{message}</div>}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/40">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">{editingId ? 'Edit employee' : 'Add employee'}</h2>
                <p className="mt-1 text-sm text-slate-400">All saved entries are sent to the backend and scored before persisting.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <input className="rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400" placeholder="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
              <input className="rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400" placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required />
              <input className="rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400" placeholder="Years at company" type="number" value={form.yearsAtCompany} onChange={(e) => setForm({ ...form, yearsAtCompany: e.target.value })} required />
              <input className="rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400" placeholder="Performance rating" type="number" step="0.1" value={form.performanceRating} onChange={(e) => setForm({ ...form, performanceRating: e.target.value })} required />
              <input className="rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
              <div className="sm:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-3xl border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-rose-400 hover:text-rose-300">
                  Cancel
                </button>
                <button type="submit" className="rounded-3xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                  Save employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
