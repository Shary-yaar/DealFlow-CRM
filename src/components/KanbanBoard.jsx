import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import DealCard from './DealCard';
import { DollarSign, FolderOpen, ArrowRightLeft } from 'lucide-react';

const PIPELINE_STAGES = ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'];

const STAGE_STYLES = {
  Lead: {
    accent: 'indigo',
    borderColor: 'border-t-indigo-500',
    titleColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    glowColor: 'group-hover:shadow-indigo-500/5',
  },
  Qualified: {
    accent: 'blue',
    borderColor: 'border-t-blue-500',
    titleColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-600 border-blue-100',
    glowColor: 'group-hover:shadow-blue-500/5',
  },
  Proposal: {
    accent: 'purple',
    borderColor: 'border-t-purple-500',
    titleColor: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-600 border-purple-100',
    glowColor: 'group-hover:shadow-purple-500/5',
  },
  Won: {
    accent: 'emerald',
    borderColor: 'border-t-emerald-500',
    titleColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    glowColor: 'group-hover:shadow-emerald-500/5',
  },
  Lost: {
    accent: 'rose',
    borderColor: 'border-t-rose-500',
    titleColor: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-600 border-rose-100',
    glowColor: 'group-hover:shadow-rose-500/5',
  },
};

export default function KanbanBoard({ deals, onRefreshDeals, onError }) {
  const [activeDragOverStage, setActiveDragOverStage] = useState(null);

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    if (activeDragOverStage !== stage) {
      setActiveDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setActiveDragOverStage(null);
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    setActiveDragOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    // Find the current deal to check if the stage actually changed
    const currentDeal = deals.find(d => d.id === dealId);
    if (currentDeal && currentDeal.stage === targetStage) return;

    try {
      const { error } = await supabase
        .from('deals')
        .update({ stage: targetStage })
        .eq('id', dealId);

      if (error) throw error;
      onRefreshDeals();
    } catch (err) {
      console.error('Drop Stage Update Error:', err);
      onError(err.message || 'Failed to update deal stage on drop.');
    }
  };

  // Group deals by stage
  const dealsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(deal => deal.stage === stage);
    return acc;
  }, {});

  // Calculate sum value for a stage
  const getStageTotalValue = (stageDeals) => {
    const total = stageDeals.reduce((sum, deal) => sum + Number(deal.value), 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(total);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full items-start overflow-x-auto pb-4 select-none">
      {PIPELINE_STAGES.map((stage) => {
        const stageDeals = dealsByStage[stage] || [];
        const totalValue = getStageTotalValue(stageDeals);
        const style = STAGE_STYLES[stage];
        const isDraggingOver = activeDragOverStage === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
            className={`flex flex-col rounded-2xl bg-slate-100/40 border-t-4 ${style.borderColor} border-l border-r border-b border-slate-200/60 p-3 min-h-[500px] md:h-[calc(100vh-220px)] transition-all duration-300 shadow-sm ${
              isDraggingOver 
                ? 'bg-slate-100/90 border-indigo-500/40 ring-1 ring-indigo-500/20 scale-[1.01]' 
                : 'hover:bg-slate-100/60'
            }`}
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
              <div>
                <h3 className={`text-sm font-bold tracking-wider ${style.titleColor}`}>
                  {stage}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Value: <span className="font-semibold text-slate-600">{totalValue}</span>
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${style.badgeBg}`}>
                {stageDeals.length}
              </span>
            </div>

            {/* Stage Cards Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-16">
              {stageDeals.length === 0 ? (
                <div className={`flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-6 h-32 text-center text-slate-400 transition-colors ${
                  isDraggingOver ? 'border-indigo-500/30 text-indigo-600 bg-white/50' : 'bg-white/20'
                }`}>
                  <FolderOpen className="w-6 h-6 mb-1.5 opacity-40 shrink-0" />
                  <span className="text-xs">No deals here</span>
                  <span className="text-[10px] opacity-60 mt-0.5">Drag cards here</span>
                </div>
              ) : (
                stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onRefreshDeals={onRefreshDeals}
                    onError={onError}
                  />
                ))
              )}
            </div>

            {/* Drop Indicator hint */}
            {isDraggingOver && (
              <div className="absolute inset-x-3 bottom-3 py-2 bg-indigo-50 border border-dashed border-indigo-300 rounded-xl text-center text-xs text-indigo-600 flex items-center justify-center gap-1.5 shadow-sm">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Drop to move to {stage}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
