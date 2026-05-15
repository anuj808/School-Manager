import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Bus, MapPin, Plus, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TransportAdmin() {
  const [routes, setRoutes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState('routes');

  const [routeForm, setRouteForm] = useState({ route_name: '', bus_no: '', driver_name: '', driver_phone: '', fee_amount: '' });
  const [stopsInput, setStopsInput] = useState('');
  
  const [assignForm, setAssignForm] = useState({ student_id: '', route_id: '', stop_name: '', fee_amount: '' });

  useEffect(() => {
    fetchRoutes();
    fetchAllocations();
    api.get('/students').then(res => setStudents(res.data.data));
  }, []);

  const fetchRoutes = async () => { try { const res = await api.get('/transport/routes'); setRoutes(res.data.data); } catch(e){} };
  const fetchAllocations = async () => { try { const res = await api.get('/transport/allocations'); setAllocations(res.data.data); } catch(e){} };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    const stopsArray = stopsInput.split(',').map(s=>s.trim()).filter(s=>s.length>0);
    try {
      await api.post('/transport/routes', { ...routeForm, stops: stopsArray });
      toast.success('Route added!');
      fetchRoutes();
      setRouteForm({ route_name: '', bus_no: '', driver_name: '', driver_phone: '', fee_amount: '' });
      setStopsInput('');
    } catch (e) { toast.error('Failed to add route'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transport/assign', assignForm);
      toast.success('Student assigned to route!');
      fetchAllocations();
      setAssignForm({ student_id: '', route_id: '', stop_name: '', fee_amount: '' });
    } catch (e) { toast.error('Failed to assign student'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bus /> Transport Management</h1>
          <p className="text-gray-500">Manage bus routes, drivers, and student allocations.</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={()=>setTab('routes')} className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab==='routes'?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-900'}`}>Routes</button>
          <button onClick={()=>setTab('allocations')} className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab==='allocations'?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-900'}`}>Allocations</button>
        </div>
      </div>

      {tab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600 font-semibold"><th className="px-4 py-3">Route & Bus</th><th className="px-4 py-3">Driver Info</th><th className="px-4 py-3">Stops</th><th className="px-4 py-3">Fee Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routes.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.route_name}<br/><span className="text-xs text-gray-500 font-mono">Bus: {r.bus_no}</span></td>
                    <td className="px-4 py-3 text-gray-600">{r.driver_name}<br/><span className="text-xs">{r.driver_phone}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.stops?.join(' → ')}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">${r.fee_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18}/> New Route</h3>
            <form onSubmit={handleAddRoute} className="space-y-4 text-sm">
              <input required placeholder="Route Name (e.g. Route A - North)" value={routeForm.route_name} onChange={e=>setRouteForm({...routeForm, route_name:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Bus No" value={routeForm.bus_no} onChange={e=>setRouteForm({...routeForm, bus_no:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
                <input type="number" placeholder="Fee Amount ($)" required value={routeForm.fee_amount} onChange={e=>setRouteForm({...routeForm, fee_amount:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Driver Name" value={routeForm.driver_name} onChange={e=>setRouteForm({...routeForm, driver_name:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
                <input required placeholder="Driver Phone" value={routeForm.driver_phone} onChange={e=>setRouteForm({...routeForm, driver_phone:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <textarea required placeholder="Enter stops separated by comma (e.g. Main St, Oak Rd, School)" value={stopsInput} onChange={e=>setStopsInput(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-24 text-sm"/>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Add Route</button>
            </form>
          </div>
        </div>
      )}

      {tab === 'allocations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600 font-semibold"><th className="px-4 py-3">Student</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Pickup Stop</th><th className="px-4 py-3">Transport Fee</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allocations.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.Student?.full_name} <br/><span className="text-xs text-gray-500 font-mono">{a.Student?.admission_no}</span></td>
                    <td className="px-4 py-3 text-gray-600">{a.TransportRoute?.route_name}</td>
                    <td className="px-4 py-3 font-medium text-gray-800"><MapPin size={14} className="inline mr-1 text-red-500"/>{a.stop_name}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">${a.fee_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><UserPlus size={18}/> Assign Student</h3>
            <form onSubmit={handleAssign} className="space-y-4 text-sm">
              <select required value={assignForm.student_id} onChange={e=>setAssignForm({...assignForm, student_id:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="">Select Student</option>
                {students.map(s=><option key={s.id} value={s.id}>{s.full_name} ({s.admission_no})</option>)}
              </select>
              <select required value={assignForm.route_id} onChange={e=>{
                const r = routes.find(x=>x.id==e.target.value);
                setAssignForm({...assignForm, route_id:e.target.value, fee_amount: r ? r.fee_amount : ''});
              }} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="">Select Route</option>
                {routes.map(r=><option key={r.id} value={r.id}>{r.route_name}</option>)}
              </select>
              {assignForm.route_id && (
                <select required value={assignForm.stop_name} onChange={e=>setAssignForm({...assignForm, stop_name:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                  <option value="">Select Pickup Stop</option>
                  {routes.find(r=>r.id==assignForm.route_id)?.stops?.map(st=><option key={st} value={st}>{st}</option>)}
                </select>
              )}
              <input type="number" placeholder="Fee Amount ($)" required value={assignForm.fee_amount} onChange={e=>setAssignForm({...assignForm, fee_amount:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Assign to Route</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
