import React from 'react';
import { Channel, ThemeMode } from '../types';
import { ProjectTemplate, PROJECT_TEMPLATES } from '../data/projectTemplates';
import {
  Zap,
  TrendingUp,
  Gamepad2,
  Package,
  Gavel,
  Mic,
  Sparkles,
  Cpu,
  X,
  LayoutTemplate,
  Rocket,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  TrendingUp,
  Gamepad2,
  Package,
  Gavel,
  Mic,
  Sparkles,
  Cpu,
};

interface ProjectTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawnTemplate: (channel: Channel) => void;
  theme: ThemeMode;
}

export function ProjectTemplatesModal({
  isOpen,
  onClose,
  onSpawnTemplate,
  theme,
}: ProjectTemplatesModalProps) {
  if (!isOpen) return null;

  const handleSpawn = (template: ProjectTemplate) => {
    const newChannel: Channel = {
      ...template.channel,
      id: `tpl-${template.id}-${Date.now().toString().slice(-5)}`,
    };
    onSpawnTemplate(newChannel);
    onClose();
  };

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden font-sans flex flex-col max-h-[90vh] ${
          isLight ? 'bg-white border-zinc-200' : 'bg-[#0a0a0c] border-white/15'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-zinc-200 bg-zinc-50' : 'border-white/10 bg-zinc-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-[#00FF00]/10 border-[#00FF00]/30 text-[#00FF00]'
              }`}
            >
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-black tracking-wider uppercase font-mono ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}
                >
                  PROJECT TEMPLATES
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                    isLight
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      : 'bg-[#00FF00]/20 text-[#00FF00] border-[#00FF00]/40'
                  }`}
                >
                  ONE-CLICK SPAWN
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Pick a template to instantly create a pre-configured stream with safeguards armed.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECT_TEMPLATES.map((template: ProjectTemplate) => {
              const Icon = ICON_MAP[template.icon] || Zap;
              return (
                <button
                  key={template.id}
                  onClick={() => handleSpawn(template)}
                  className={`p-5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col gap-3 ${
                    template.bgColor
                  } ${isLight ? 'hover:shadow-md' : 'hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'} hover:scale-[1.02]`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg ${isLight ? 'bg-white/60' : 'bg-black/40'} ${template.accentColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[8px] font-mono font-bold uppercase px-2 py-1 rounded border ${
                        isLight ? 'border-zinc-200 text-zinc-500 bg-white/50' : 'border-white/10 text-zinc-500 bg-black/30'
                      }`}
                    >
                      {template.category.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {template.name}
                    </h4>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {template.description}
                    </p>
                  </div>

                  <div
                    className={`flex items-center justify-between pt-2 border-t ${
                      isLight ? 'border-zinc-200' : 'border-white/10'
                    }`}
                  >
                    <div className="flex gap-3 text-[10px] font-mono">
                      <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>
                        👁 {template.channel.currentViewers.toLocaleString()}
                      </span>
                      <span
                        className={
                          template.channel.authorizedRatio < 0.5
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }
                      >
                        {Math.round(template.channel.authorizedRatio * 100)}% human
                      </span>
                    </div>
                    <span
                      className={`flex items-center gap-1 text-[10px] font-mono font-bold uppercase ${template.accentColor} group-hover:translate-x-0.5 transition-transform`}
                    >
                      <Rocket className="w-3 h-3" />
                      SPAWN
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-[10px] font-mono ${
            isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-400' : 'border-white/10 bg-zinc-950 text-zinc-400'
          }`}
        >
          <span>Click any template to instantly spawn a fully configured stream.</span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
              isLight
                ? 'border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                : 'border-white/20 hover:bg-white/10 text-white'
            }`}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
