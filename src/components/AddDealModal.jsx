import React, { useState } from 'react';
import { X, DollarSign, FolderPlus, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const PIPELINE_STAGES = ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'];

export default function AddDealModal({ isOpen, onClose, contacts, onRefreshDeals, onOpenContacts, onError }) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('Lead');
  const [contactId, setContactId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      onError('Deal Title is required.');
      return;
    }
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      onError('Please enter a valid positive deal value.');
      return;
    }
    if (!contactId) {
      onError('You must select a contact for this deal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('deals')
        .insert([{
          title: title.trim(),
          value: numericValue,
          stage,
          contact_id: contactId
        }]);

      if (error) throw error;

      // Reset state and close
      setTitle('');
      setValue('');
      setStage('Lead');
      setContactId('');
      onRefreshDeals();
      onClose();
    } catch (err) {
      console.error('Add Deal Error:', err);
      onError(err.message || 'Failed to create deal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl glass-panel shadow-2xl border border-slate-200/80 flex flex-col animate-in fade-in zoom-in duration-200 bg-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/50">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Create New Deal</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          {contacts.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm space-y-3 text-center shadow-sm">
              <p>You need to create at least one contact before adding a deal.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenContacts();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
              >
                Go to Contacts
              </button>
            </div>
          ) : (
            <>
              {/* Deal Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deal Title</label>
                <input 
                  type="text"
                  placeholder="E.g., Enterprise Software License"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-sm transition-colors shadow-sm"
                  required
                />
              </div>

              {/* Deal Value & Stage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Value (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="15000"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-sm transition-colors shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-sm transition-colors shadow-sm cursor-pointer"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Associated Contact */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Contact</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-sm transition-colors shadow-sm cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select a contact...</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-4 h-4" />
                      Create Deal
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>

      </div>
    </div>
  );
}
