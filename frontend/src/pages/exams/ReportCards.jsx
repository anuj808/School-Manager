import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await api.get('/report-cards');
      setCards(res.data.data);
    } catch (error) {
      toast.error('Failed to load report cards');
    }
    setLoading(false);
  };

  const handleDownload = async (id, fileName) => {
    toast.loading('Generating PDF...', { id: 'pdf' });
    try {
      const res = await api.get(`/report-cards/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      toast.success('Downloaded!', { id: 'pdf' });
    } catch (error) {
      toast.error('Failed to download PDF', { id: 'pdf' });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText /> My Report Cards</h1>
        <p className="text-gray-500">View and download your official academic report cards.</p>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading your academic records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(rc => (
            <div key={rc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">FINALIZED</span>
                <span className="text-sm font-semibold text-gray-500">{rc.Exam?.exam_type}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900">{rc.Exam?.exam_name}</h3>
              <p className="text-gray-600 mt-1">Class: {rc.Exam?.Class?.name} - {rc.Exam?.Class?.section}</p>
              
              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Percentage</p>
                  <p className="text-lg font-bold text-gray-900">{rc.percentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Grade</p>
                  <p className="text-lg font-bold text-indigo-600">{rc.grade}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Rank</p>
                  <p className="text-lg font-bold text-gray-900">#{rc.rank}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Result</p>
                  <p className={`text-lg font-bold uppercase ${rc.result === 'pass' ? 'text-green-600' : 'text-red-600'}`}>{rc.result}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 mt-auto">
                <button 
                  onClick={() => handleDownload(rc.id, `ReportCard_${rc.Student?.admission_no}_${rc.Exam?.exam_name}.pdf`)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2.5 rounded-lg hover:bg-indigo-100 font-medium transition"
                >
                  <Download size={18} /> Download PDF
                </button>
              </div>
            </div>
          ))}
          {cards.length === 0 && <div className="col-span-3 text-gray-500 py-8 text-center bg-white rounded-xl border border-dashed">No published report cards available yet.</div>}
        </div>
      )}
    </div>
  );
}
