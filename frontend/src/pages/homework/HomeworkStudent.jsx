import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PencilLine, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function HomeworkStudent() {
  const [homeworks, setHomeworks] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  
  const [submitModal, setSubmitModal] = useState(false);
  const [activeHw, setActiveHw] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const fetchHomeworks = async () => {
    try {
      const res = await api.get('/homework');
      setHomeworks(res.data.data);
    } catch (e) { toast.error('Failed to load homework'); }
  };

  const pending = homeworks.filter(h => !h.my_submission);
  const submitted = homeworks.filter(h => h.my_submission);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/homework/submit', { homework_id: activeHw.id, text_content: submissionContent });
      toast.success('Homework submitted successfully!');
      setSubmitModal(false);
      setSubmissionContent('');
      fetchHomeworks();
    } catch (e) { toast.error('Submission failed'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><PencilLine /> My Homework</h1>
        <p className="text-gray-500">View and submit pending assignments.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={()=>setActiveTab('pending')} className={`px-6 py-2 rounded-full font-bold text-sm transition ${activeTab==='pending'?'bg-indigo-600 text-white shadow-md':'bg-white text-gray-600 border border-gray-200'}`}>Pending ({pending.length})</button>
        <button onClick={()=>setActiveTab('submitted')} className={`px-6 py-2 rounded-full font-bold text-sm transition ${activeTab==='submitted'?'bg-indigo-600 text-white shadow-md':'bg-white text-gray-600 border border-gray-200'}`}>Submitted ({submitted.length})</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'pending' ? pending : submitted).map(hw => {
          const isOverdue = new Date() > new Date(hw.due_date) && !hw.my_submission;
          return (
            <div key={hw.id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-indigo-600">{hw.Subject?.subject_name}</span>
                {isOverdue && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1"><AlertCircle size={12}/> OVERDUE</span>}
                {hw.my_submission && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> SUBMITTED</span>}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{hw.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{hw.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                  <span>Teacher: {hw.Staff?.full_name}</span>
                  <span className={isOverdue ? 'text-red-600 font-bold' : ''}>Due: {hw.due_date}</span>
                </div>
                
                {!hw.my_submission ? (
                  <button onClick={()=>{setActiveHw(hw); setSubmitModal(true);}} className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2.5 rounded-lg hover:bg-indigo-100 font-bold transition">
                    <UploadCloud size={18}/> Submit Work
                  </button>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <span className="font-bold text-gray-700">My Submission:</span><br/>
                    <span className="text-gray-600">{hw.my_submission.feedback}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {(activeTab === 'pending' ? pending : submitted).length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">No homework found in this section!</div>
        )}
      </div>

      {submitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold text-gray-900">Submit: {activeHw.title}</h3></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-4 bg-indigo-50 text-indigo-900 rounded-lg text-sm border border-indigo-100 mb-4">
                <strong>Instructions:</strong> {activeHw.description}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Submission / Answer</label>
                <textarea required value={submissionContent} onChange={e=>setSubmissionContent(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-32" placeholder="Type your answer or provide a link to your work here..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSubmitModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
