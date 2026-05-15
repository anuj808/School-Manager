import React, { useState } from 'react';
import { Mail, BellRing, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    email_fee_reminders: true,
    email_attendance_alerts: true,
    email_result_published: true,
    in_app_notices: true
  });

  const handleSave = () => {
    // Mock save logic
    toast.success('Notification preferences saved successfully!');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Toaster position="top-right" />
      <div className="mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BellRing /> Notification Settings</h1>
        <p className="text-gray-500">Manage how you receive alerts and emails from the school system.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <Mail className="text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-800">Email Notifications</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Fee Due Reminders</h3>
              <p className="text-sm text-gray-500">Receive an email when a fee due date is approaching or missed.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.email_fee_reminders} onChange={e=>setSettings({...settings, email_fee_reminders: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Attendance Alerts</h3>
              <p className="text-sm text-gray-500">Automated email alert if the student is marked absent 3 days in a row.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.email_attendance_alerts} onChange={e=>setSettings({...settings, email_attendance_alerts: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Result Publishing</h3>
              <p className="text-sm text-gray-500">Get notified instantly when the Principal publishes the final report cards.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.email_result_published} onChange={e=>setSettings({...settings, email_result_published: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2">
            <Save size={18} /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
