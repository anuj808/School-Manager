import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const schema = z.object({
  admission_no: z.string().min(1, 'Admission number is required'),
  full_name: z.string().min(2, 'Name is too short'),
  dob: z.string().min(1, 'DOB is required'),
  gender: z.string().min(1, 'Gender is required'),
  blood_group: z.string().optional(),
  admission_date: z.string().min(1, 'Admission date is required'),
  address: z.string().min(1, 'Address is required'),
  father_name: z.string().min(1, 'Father name is required'),
  mother_name: z.string().min(1, 'Mother name is required'),
  phone: z.string().min(10, 'Valid phone required'),
  parent_email: z.string().email('Invalid email'),
});

export default function StudentForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      admission_date: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/students', data);
      toast.success('Student admitted successfully!');
      setTimeout(() => navigate('/students'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit form');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Admission</h1>
          <p className="text-gray-500">Fill in the student and parent details below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Student Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number *</label>
              <input {...register('admission_no')} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              {errors.admission_no && <p className="text-red-500 text-xs mt-1">{errors.admission_no.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register('full_name')} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input type="date" {...register('dob')} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select {...register('gender')} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select {...register('blood_group')} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option> <option value="A-">A-</option>
                <option value="B+">B+</option> <option value="B-">B-</option>
                <option value="O+">O+</option> <option value="O-">O-</option>
                <option value="AB+">AB+</option> <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
              <input type="date" {...register('admission_date')} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea {...register('address')} rows="3" className="w-full border border-gray-300 rounded-lg px-4 py-2"></textarea>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Parent/Guardian Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
              <input {...register('father_name')} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name *</label>
              <input {...register('mother_name')} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone *</label>
              <input {...register('phone')} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="+1..." />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email *</label>
              <input type="email" {...register('parent_email')} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              {errors.parent_email && <p className="text-red-500 text-xs mt-1">{errors.parent_email.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save size={20} /> Save Admission</>}
          </button>
        </div>
      </form>
    </div>
  );
}
