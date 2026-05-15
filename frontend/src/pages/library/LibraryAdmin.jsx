import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Book, Plus, BookUp, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function LibraryAdmin() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [tab, setTab] = useState('catalog');

  const [bookForm, setBookForm] = useState({ isbn: '', title: '', author: '', publisher: '', category: '', copies_total: 1, copies_available: 1, shelf_no: '' });
  const [issueForm, setIssueForm] = useState({ book_id: '', student_id: '', due_date: '' });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchBooks();
    fetchIssues();
    api.get('/students').then(res => setStudents(res.data.data));
  }, []);

  const fetchBooks = async () => {
    try { const res = await api.get('/library/books'); setBooks(res.data.data); } catch (e) {}
  };
  const fetchIssues = async () => {
    try { const res = await api.get('/library/issues'); setIssues(res.data.data); } catch (e) {}
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/library/books', bookForm);
      toast.success('Book added successfully');
      fetchBooks();
      setBookForm({ isbn: '', title: '', author: '', publisher: '', category: '', copies_total: 1, copies_available: 1, shelf_no: '' });
    } catch (e) { toast.error('Failed to add book'); }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/library/issue', issueForm);
      toast.success('Book issued!');
      fetchIssues(); fetchBooks();
      setIssueForm({ book_id: '', student_id: '', due_date: '' });
    } catch (e) { toast.error('Failed to issue book'); }
  };

  const handleReturn = async (id) => {
    try {
      const res = await api.post(`/library/return/${id}`);
      toast.success(res.data.message);
      fetchIssues(); fetchBooks();
    } catch (e) { toast.error('Failed to return book'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Book /> Library Management</h1>
          <p className="text-gray-500">Manage book catalog, issues, and returns.</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={()=>setTab('catalog')} className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab==='catalog'?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-900'}`}>Catalog</button>
          <button onClick={()=>setTab('issues')} className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab==='issues'?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-900'}`}>Issue Tracking</button>
        </div>
      </div>

      {tab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600 font-semibold"><th className="px-4 py-3">Title & Author</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Copies (Avail/Total)</th><th className="px-4 py-3">Shelf</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="font-medium text-gray-900">{b.title}</div><div className="text-gray-500 text-xs">{b.author} | {b.isbn}</div></td>
                    <td className="px-4 py-3 text-gray-600">{b.category}</td>
                    <td className="px-4 py-3 font-medium"><span className={b.copies_available>0?'text-green-600':'text-red-500'}>{b.copies_available}</span> / {b.copies_total}</td>
                    <td className="px-4 py-3 text-gray-500">{b.shelf_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18}/> Add New Book</h3>
            <form onSubmit={handleAddBook} className="space-y-4 text-sm">
              <input required placeholder="ISBN" value={bookForm.isbn} onChange={e=>setBookForm({...bookForm, isbn:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              <input required placeholder="Title" value={bookForm.title} onChange={e=>setBookForm({...bookForm, title:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              <input required placeholder="Author" value={bookForm.author} onChange={e=>setBookForm({...bookForm, author:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              <input placeholder="Category (e.g. Science, Fiction)" value={bookForm.category} onChange={e=>setBookForm({...bookForm, category:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Total Copies" required min="1" value={bookForm.copies_total} onChange={e=>setBookForm({...bookForm, copies_total:e.target.value, copies_available:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
                <input placeholder="Shelf No." value={bookForm.shelf_no} onChange={e=>setBookForm({...bookForm, shelf_no:e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Add Book</button>
            </form>
          </div>
        </div>
      )}

      {tab === 'issues' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600 font-semibold"><th className="px-4 py-3">Student</th><th className="px-4 py-3">Book</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Fine Status</th><th className="px-4 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {issues.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{i.Student?.full_name} <br/><span className="text-xs text-gray-500 font-mono">{i.Student?.admission_no}</span></td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">{i.LibraryBook?.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">Issued: {i.issue_date}<br/>Due: {i.due_date}</td>
                    <td className="px-4 py-3">
                      {i.current_fine > 0 ? <span className="text-red-600 font-bold">Rs. {i.current_fine}</span> : <span className="text-green-600 font-medium">On Track</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleReturn(i.id)} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-100">Mark Returned</button>
                    </td>
                  </tr>
                ))}
                {issues.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-gray-500">No active book issues.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookUp size={18}/> Issue Book</h3>
            <form onSubmit={handleIssue} className="space-y-4 text-sm">
              <select required value={issueForm.book_id} onChange={e=>setIssueForm({...issueForm, book_id:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="">Select Book</option>
                {books.filter(b=>b.copies_available>0).map(b=><option key={b.id} value={b.id}>{b.title} ({b.copies_available} left)</option>)}
              </select>
              <select required value={issueForm.student_id} onChange={e=>setIssueForm({...issueForm, student_id:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="">Select Student</option>
                {students.map(s=><option key={s.id} value={s.id}>{s.full_name} ({s.admission_no})</option>)}
              </select>
              <input type="date" required value={issueForm.due_date} onChange={e=>setIssueForm({...issueForm, due_date:e.target.value})} className="w-full border rounded-lg px-3 py-2" title="Due Date"/>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Issue Book</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
