import React, { useState } from 'react';
import { Trash2, Sparkles, User, Building2, Mail, Loader2, GripVertical, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { streamNextAction } from '../lib/geminiStream';

const PIPELINE_STAGES = ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'];

export default function DealCard({ deal, onRefreshDeals, onError }) {
  const [suggestion, setSuggestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [aiError, setAiError] = useState('');

  const contact = deal.contacts || {};
  
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(deal.value);

  const handleStageChange = async (newStage) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ stage: newStage })
        .eq('id', deal.id);

      if (error) throw error;
      onRefreshDeals();
    } catch (err) {
      console.error('Update Stage Error:', err);
      onError(err.message || 'Failed to update deal stage.');
    }
  };

  const handleDeleteDeal = async () => {
    if (!window.confirm(`Are you sure you want to delete the deal "${deal.title}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', deal.id);

      if (error) throw error;
      onRefreshDeals();
    } catch (err) {
      console.error('Delete Deal Error:', err);
      onError(err.message || 'Failed to delete deal.');
      setIsDeleting(false);
    }
  };

  const handleSuggestAction = async () => {
    setIsAiLoading(true);
    setAiError('');
    setSuggestion('');
    
    try {
      await streamNextAction(deal, (chunk) => {
        setIsAiLoading(false);
        setSuggestion((prev) => prev + chunk);
      });
    } catch (err) {
      console.error('AI Stream Error:', err);
      setAiError(err.message || 'Failed to get recommendation.');
      setIsAiLoading(false);
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className="group relative flex flex-col p-4 rounded-xl glass-card border border-slate-200/60 hover:border-indigo-500/20 transition-all duration-300 select-none cursor-grab active:cursor-grabbing bg-white shadow-sm"
    >
      {/* Top Section / Drag handle and Delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="text-slate-400 cursor-grab group-hover:text-slate-600 transition-colors">
            <GripVertical className="w-4 h-4 shrink-0" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 truncate" title={deal.title}>
            {deal.title}
          </h4>
        </div>
        
        <button
          onClick={handleDeleteDeal}
          disabled={isDeleting}
          className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer disabled:opacity-50"
          title="Delete Deal"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Value */}
      <div className="mt-2 text-lg font-extrabold text-indigo-600">
        {formattedValue}
      </div>

      {/* Contact Details Panel */}
      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1.5 text-xs text-slate-500 shadow-inner">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">{contact.name || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{contact.company || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px] select-all cursor-text">{contact.email || 'N/A'}</span>
        </div>
      </div>

      {/* Bottom Row / Stage dropdown and AI Action */}
      <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 bg-white">
        <select
          value={deal.stage}
          onChange={(e) => handleStageChange(e.target.value)}
          className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
        >
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={handleSuggestAction}
          disabled={isAiLoading}
          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-indigo-100 hover:border-indigo-500 transition-all shadow-sm cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200"
        >
          {isAiLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Suggest Action
            </>
          )}
        </button>
      </div>

      {/* Inline AI Recommendation Box */}
      {(isAiLoading || suggestion || aiError) && (
        <div className="mt-3 p-3 rounded-lg bg-indigo-50/50 border border-indigo-200/60 text-xs animate-in slide-in-from-top-2 duration-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-indigo-600 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Sales Recommendation:</span>
          </div>

          {/* Initial loading state before chunks stream in */}
          {isAiLoading && !suggestion && (
            <div className="flex items-center gap-1.5 text-slate-400 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
              <span>Initializing suggestion stream...</span>
            </div>
          )}

          {/* The typed output */}
          {suggestion && (
            <p className={`text-slate-600 leading-relaxed font-medium ${isAiLoading ? 'stream-text' : ''}`}>
              {suggestion}
            </p>
          )}

          {/* Error state */}
          {aiError && (
            <div className="flex items-start gap-1 text-rose-600 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{aiError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
