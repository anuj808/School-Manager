import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Bus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyTransport() {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transport/my-route').then(res => {
      setRoute(res.data.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load transport details');
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bus /> My Transport Route</h1>
        <p className="text-gray-500">View your assigned bus details and pickup stop.</p>
      </div>

      {!route ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
          <Bus size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Not Assigned</h2>
          <p className="text-gray-500">You are not currently assigned to any school transport route.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">{route.TransportRoute?.route_name}</h2>
            <div className="flex gap-4 text-indigo-100 font-medium">
              <span>Bus No: {route.TransportRoute?.bus_no}</span>
              <span>Driver: {route.TransportRoute?.driver_name} ({route.TransportRoute?.driver_phone})</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">My Pickup Location</h3>
            <div className="flex items-center gap-3 p-4 bg-gray-50 border rounded-xl shadow-sm">
              <div className="p-3 bg-red-100 text-red-600 rounded-full"><MapPin size={24} /></div>
              <div>
                <div className="font-bold text-gray-900 text-lg">{route.stop_name}</div>
                <div className="text-sm text-gray-500">Assigned Transport Fee: ${route.fee_amount}/term</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
