import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { ArrowRight, BrainCircuit } from 'lucide-react';

const SymptomQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    primaryConcern: '',
    duration: '',
    severity: '5',
    medications: '',
    allergies: ''
  });

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedAnswers = [
      { question: 'What is your primary medical concern today?', answer: answers.primaryConcern },
      { question: 'How long have you been experiencing these symptoms?', answer: answers.duration },
      { question: 'On a scale of 1-10, how severe are your symptoms?', answer: answers.severity },
      { question: 'Are you currently taking any medications?', answer: answers.medications || 'None' },
      { question: 'Do you have any known allergies?', answer: answers.allergies || 'None' }
    ];

    try {
      await axiosInstance.post(`/appointments/${id}/quiz`, { quizAnswers: formattedAnswers });
      toast.success('Pre-session quiz completed successfully! Our AI is generating a summary for your doctor.');
      navigate('/dashboard/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-teal-500 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <BrainCircuit size={28} />
            </div>
            <h1 className="text-2xl font-bold font-heading">Pre-Session Intake Quiz</h1>
          </div>
          <p className="text-primary-50 opacity-90">
            Please answer these quick questions. Our AI will analyze your responses and prepare a clinical summary for your doctor to review before your session begins.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">1. What is your primary medical concern today? *</label>
            <textarea
              name="primaryConcern"
              required
              value={answers.primaryConcern}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="E.g., I have been having severe headaches and nausea..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">2. How long have you been experiencing these symptoms? *</label>
            <input
              type="text"
              name="duration"
              required
              value={answers.duration}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="E.g., 3 days, 2 weeks, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. On a scale of 1-10, how severe are your symptoms? (Current: {answers.severity})
            </label>
            <input
              type="range"
              name="severity"
              min="1"
              max="10"
              value={answers.severity}
              onChange={handleChange}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Mild)</span>
              <span>10 (Severe)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">4. Are you currently taking any medications? (Optional)</label>
            <input
              type="text"
              name="medications"
              value={answers.medications}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="List any daily medications"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">5. Do you have any known allergies? (Optional)</label>
            <input
              type="text"
              name="allergies"
              value={answers.allergies}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="List any allergies to food or medicine"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? 'Processing with AI...' : 'Submit to Doctor'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomQuiz;
