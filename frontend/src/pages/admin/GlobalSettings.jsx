import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { Settings, Save, Info, Bell, Building, CreditCard } from 'lucide-react';

export default function GlobalSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    platform_name: 'School ERP',
    support_email: 'support@schoolerp.com',
    default_academic_year: '2026-2027',
    default_trial_days: '30',
    default_student_limit: '50',
    send_welcome_email: 'true',
    send_fee_reminders: 'true',
    send_attendance_alerts: 'false',
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data.data && Object.keys(res.data.data).length > 0) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? String(checked) : value
    }));
  };

  const plans = [
    { name: 'Free Trial', price: '₹0', limit: '50', features: 'All features, 30 days' },
    { name: 'Starter', price: '₹999/mo', limit: '300', features: 'Core modules' },
    { name: 'Growth', price: '₹2,499/mo', limit: '1,000', features: 'All modules' },
    { name: 'Pro', price: '₹4,999/mo', limit: 'Unlimited', features: 'Everything + Priority' },
  ];

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto pb-12">
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Settings size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Global Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition font-medium shadow-sm disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </nav>

        <div className="p-8 max-w-5xl mx-auto space-y-8">
          <Toaster position="top-right" />
          
          {/* Section 1: Platform Info */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-2 font-semibold text-gray-800">
              <Info size={18} className="text-indigo-600" /> Platform Info
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Platform Name</label>
                <input name="platform_name" value={settings.platform_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Support Email</label>
                <input name="support_email" type="email" value={settings.support_email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Platform Version</label>
                <input value="v2.4.0 (Stable)" disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
              </div>
            </div>
          </section>

          {/* Section 2: School Defaults */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-2 font-semibold text-gray-800">
              <Building size={18} className="text-indigo-600" /> School Defaults
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Default Academic Year</label>
                <input name="default_academic_year" value={settings.default_academic_year} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Trial Period (Days)</label>
                <input name="default_trial_days" type="number" value={settings.default_trial_days} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Student Limit (Free Trial)</label>
                <input name="default_student_limit" type="number" value={settings.default_student_limit} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </section>

          {/* Section 3: Email Notifications */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-2 font-semibold text-gray-800">
              <Bell size={18} className="text-indigo-600" /> Email Notifications
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="send_welcome_email" checked={settings.send_welcome_email === 'true'} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm font-medium text-gray-700">Send welcome email on school registration</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="send_fee_reminders" checked={settings.send_fee_reminders === 'true'} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm font-medium text-gray-700">Send fee reminder emails (Global Cron)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="send_attendance_alerts" checked={settings.send_attendance_alerts === 'true'} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm font-medium text-gray-700">Send attendance alert emails (Global Cron)</span>
                </label>
              </div>

              <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">SMTP Host</label>
                  <input name="smtp_host" value={settings.smtp_host} onChange={handleChange} placeholder="smtp.mailgun.org" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">SMTP Port</label>
                  <input name="smtp_port" value={settings.smtp_port} onChange={handleChange} placeholder="587" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">SMTP User</label>
                  <input name="smtp_user" value={settings.smtp_user} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">SMTP Password</label>
                  <input name="smtp_password" type="password" value={settings.smtp_password} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Subscription Plans */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-gray-800">
                <CreditCard size={18} className="text-indigo-600" /> Subscription Plans
              </div>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Read Only</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500 bg-white">
                    <th className="px-6 py-4 font-semibold">Plan</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">Student Limit</th>
                    <th className="px-6 py-4 font-semibold">Features</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.map(p => (
                    <tr key={p.name} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-700">{p.price}</td>
                      <td className="px-6 py-4 text-gray-600">{p.limit}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{p.features}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
