import React, { useState } from "react";
import { ResumeData, ResumeVersion } from "../types/resume";
import { ResumeTemplates } from "./ResumeTemplates";
import { History, Save, RefreshCw, Eye, Trash2, X, AlertCircle } from "lucide-react";

interface VersionManagerProps {
  currentData: ResumeData;
  versions: ResumeVersion[];
  onSaveVersion: (name: string) => void;
  onRestoreVersion: (version: ResumeVersion) => void;
  onDeleteVersion: (id: string) => void;
  primaryColor: string;
  isCV: boolean;
  templateId: string;
}

export const VersionManager: React.FC<VersionManagerProps> = ({
  currentData,
  versions,
  onSaveVersion,
  onRestoreVersion,
  onDeleteVersion,
  primaryColor,
  isCV,
  templateId,
}) => {
  const [newVersionName, setNewVersionName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [compareVersion, setCompareVersion] = useState<ResumeVersion | null>(null);

  const handleSave = () => {
    if (!newVersionName.trim()) return;
    onSaveVersion(newVersionName.trim());
    setNewVersionName("");
    setIsSaving(false);
  };

  return (
    <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-violet-400" />
          <h3 className="font-display font-semibold text-sm text-zinc-200">VERSION MANAGER</h3>
        </div>
        <button
          onClick={() => setIsSaving(true)}
          className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
        >
          <Save className="w-3.5 h-3.5" />
          Save Current State
        </button>
      </div>

      {isSaving && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 space-y-2">
          <label className="block text-[10px] text-zinc-400 font-medium">Version Name / Label</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
              placeholder="e.g. Software Dev V1 - Standard"
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-violet-600 hover:bg-violet-750 text-white rounded text-xs font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => setIsSaving(false)}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {versions.length === 0 ? (
        <div className="text-center py-6 text-xs text-zinc-500 italic flex flex-col items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-zinc-650" />
          No historical versions saved yet. Saving versions helps you backup states before edits.
        </div>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-lg flex items-center justify-between gap-3 hover:bg-zinc-900/80 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-300 truncate">{ver.versionName}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{new Date(ver.timestamp).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-1">
                {/* Compare */}
                <button
                  onClick={() => setCompareVersion(ver)}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
                  title="Compare with Current"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                {/* Restore */}
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to restore ${ver.versionName}? Current unsaved edits will be overridden.`)) {
                      onRestoreVersion(ver);
                    }
                  }}
                  className="p-1.5 hover:bg-zinc-800 text-violet-400 hover:text-violet-300 rounded transition-colors"
                  title="Restore Version"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {/* Delete */}
                <button
                  onClick={() => {
                    if (confirm(`Delete version: ${ver.versionName}?`)) {
                      onDeleteVersion(ver.id);
                    }
                  }}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VERSION COMPARISON DIALOG OVERLAY */}
      {compareVersion && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-violet-400" />
                  Version Comparison View
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Comparing current working document (Left) vs saved version "{compareVersion.versionName}" (Right)
                </p>
              </div>
              <button
                onClick={() => setCompareVersion(null)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 bg-zinc-800/80 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Templates */}
            <div className="flex-1 flex overflow-hidden divide-x divide-zinc-850 bg-zinc-900/20">
              {/* Working State */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-zinc-950 border-b border-zinc-850 text-center font-display font-semibold text-xs text-zinc-400">
                  CURRENT EDITOR STATE
                </div>
                <div className="flex-1 overflow-y-auto p-6 scale-90 origin-top">
                  <ResumeTemplates
                    data={currentData}
                    primaryColor={primaryColor}
                    isCV={isCV}
                    templateId={templateId}
                  />
                </div>
              </div>

              {/* Compare State */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-zinc-950 border-b border-zinc-850 text-center font-display font-semibold text-xs text-zinc-400">
                  SAVED VERSION: {compareVersion.versionName}
                </div>
                <div className="flex-1 overflow-y-auto p-6 scale-90 origin-top">
                  <ResumeTemplates
                    data={compareVersion.data}
                    primaryColor={primaryColor}
                    isCV={isCV}
                    templateId={templateId}
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setCompareVersion(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-semibold transition-colors"
              >
                Close Comparison
              </button>
              <button
                onClick={() => {
                  if (confirm(`Restore saved version: ${compareVersion.versionName}? This overrides current unsaved edits.`)) {
                    onRestoreVersion(compareVersion);
                    setCompareVersion(null);
                  }
                }}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-lg text-sm font-semibold shadow-lg shadow-violet-950/30"
              >
                Restore This Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
