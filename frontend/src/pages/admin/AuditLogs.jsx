import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter } from 'lucide-react';
import api from '../../api/axios';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ action: '', table: '' });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      let url = '/audit-logs?';
      if (filters.action) url += `action=${filters.action}&`;
      if (filters.table) url += `table=${filters.table}&`;
      const res = await api.get(url);
      setLogs(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getActionColor = (action) => {
    if (action === 'POST') return 'bg-green-100 text-green-700';
    if (action === 'PUT' || action === 'PATCH') return 'bg-orange-100 text-orange-700';
    if (action === 'DELETE') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="text-indigo-600" /> Security Audit Logs
        </h1>
        <p className="text-gray-500">Immutable record of all system mutations and activities.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Filter by Action</label>
          <select value={filters.action} onChange={e=>setFilters({...filters, action: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50">
            <option value="">All Actions</option>
            <option value="POST">CREATE (POST)</option>
            <option value="PUT">UPDATE (PUT)</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Filter by Table</label>
          <select value={filters.table} onChange={e=>setFilters({...filters, table: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50">
            <option value="">All Tables</option>
            <option value="students">Students</option>
            <option value="users">Users</option>
            <option value="fees">Fees</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="p-4 font-medium">Timestamp</th>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Action</th>
              <th className="p-4 font-medium">Target Table (ID)</th>
              <th className="p-4 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition text-sm">
                <td className="p-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-4 font-medium text-gray-900">
                  {log.User?.username} <span className="text-xs text-gray-500 block">({log.User?.role})</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4 font-medium">
                  {log.table_name} <span className="text-gray-400">#{log.record_id}</span>
                </td>
                <td className="p-4 text-gray-500 font-mono text-xs">{log.ip_address || '127.0.0.1'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No audit logs found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
