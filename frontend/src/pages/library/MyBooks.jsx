import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyBooks() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get('/library/issues');
      setIssues(res.data.data);
    } catch (e) { toast.error('Failed to load books'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BookOpen /> My Library Books</h1>
        <p className="text-gray-500">View your currently issued books and due dates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map(i => {
          const isOverdue = new Date() > new Date(i.due_date);
          return (
            <div key={i.id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{i.LibraryBook?.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{i.LibraryBook?.author}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className={`text-sm font-bold flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                  <Clock size={16} /> Due: {i.due_date}
                </span>
                {isOverdue && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Fine: Rs.{i.current_fine}</span>}
              </div>
            </div>
          );
        })}
        {issues.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">You have no books currently issued.</div>
        )}
      </div>
    </div>
  );
}
