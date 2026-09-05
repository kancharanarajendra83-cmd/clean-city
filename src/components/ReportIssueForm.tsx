import React, { useState } from 'react';
import { SanitationCategory, SanitationReport } from '../types';
import { analyzeReportAI } from '../services/aiService';
import {
  Upload,
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Trash2,
  Crosshair,
} from 'lucide-react';

interface ReportIssueFormProps {
  onReportCreated: (report: SanitationReport) => void;
  onNavigateToTracker: (reportId?: string) => void;
}

const PRESET_PHOTOS = [
  {
    label: 'Dumpster Overflow',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    desc: 'Public municipal dumpsters overflowing with bags onto sidewalk and road.',
    loc: 'Central Metro Station Exit 2, Downtown Corridor',
    cat: 'Garbage Overflow',
  },
  {
    label: 'Illegal Dumping',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    desc: 'Bags of construction drywall, rubble, and concrete dumped on roadside plot.',
    loc: 'Greenwood Lane Industrial Sector',
    cat: 'Illegal Dumping',
  },
  {
    label: 'Overflowing Park Bin',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    desc: 'Recreation park bin overflowing with drink cans, cups, and food wrappers.',
    loc: 'Riverside Community Park, North Playground',
    cat: 'Overflowing Bin',
  },
  {
    label: 'Street Litter',
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    desc: 'Discarded plastic bottles and fast-food wrappers strewn along pedestrian sidewalk.',
    loc: '450 Market Street Corridor',
    cat: 'Street Litter',
  },
];

const CATEGORIES: SanitationCategory[] = [
  'Garbage Overflow',
  'Illegal Dumping',
  'Street Litter',
  'Overflowing Bin',
  'Unclean Public Space',
  'Waste Collection Issue',
  'Other',
];

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({
  onReportCreated,
  onNavigateToTracker,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Auto-detect with AI');
  const [reporterName, setReporterName] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>();

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedReport, setSubmittedReport] = useState<SanitationReport | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please upload an image file (JPG, PNG, WebP).' }));
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'File size exceeds 8MB limit.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      setPhotoBase64(result);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.photo;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  // Preset demo image selector
  const applyPreset = (preset: typeof PRESET_PHOTOS[0]) => {
    setPhotoUrl(preset.url);
    setPhotoBase64(preset.url);
    setDescription(preset.desc);
    setLocation(preset.loc);
    setSelectedCategory(preset.cat);
    setTitle(`${preset.label} at ${preset.loc.split(',')[0]}`);
    setErrors({});
  };

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, location: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setLocation(`GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W (Civic Zone)`);
        setIsLocating(false);
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.location;
          return copy;
        });
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback default city location
        setLocation('Central Ward 4 (Civic District)');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Please describe the sanitation issue in detail.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }

    if (!location.trim()) {
      newErrors.location = 'Location or street address is required.';
    }

    if (!photoUrl) {
      newErrors.photo = 'Please provide or select a photo of the sanitation issue.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit and run AI analysis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setAnalysisStatus('Initiating AI sanitation analysis...');

    try {
      setAnalysisStatus('Analyzing photo and text semantics...');

      // Call modular AI service (Gemini 3.8-Flash on server or intelligent rule engine fallback)
      const aiResult = await analyzeReportAI({
        description,
        location,
        category: selectedCategory === 'Auto-detect with AI' ? undefined : selectedCategory,
        imageBase64: photoBase64.startsWith('data:') ? photoBase64 : undefined,
      });

      setAnalysisStatus('Assigning municipal priority and dispatch recommendation...');

      // Generate unique report ID
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const reportId = `CC-2026-${randomNum}`;
      const nowIso = new Date().toISOString();

      const newReport: SanitationReport = {
        id: reportId,
        title: title.trim() || `${aiResult.category} at ${location.split(',')[0]}`,
        description: description.trim(),
        location: location.trim(),
        coordinates,
        category: aiResult.category,
        status: 'Reported',
        priority: aiResult.priority,
        severity: aiResult.severity,
        aiSummary: aiResult.summary,
        recommendedAction: aiResult.recommendedAction,
        photoUrl: photoUrl,
        submittedAt: nowIso,
        updatedAt: nowIso,
        reporterName: reporterName.trim() || 'Civic Contributor',
        timeline: [
          {
            id: `evt-${Date.now()}-1`,
            status: 'Reported',
            timestamp: nowIso,
            title: 'Report Submitted',
            notes: 'Citizen submitted report with photographic evidence and location metadata.',
            actor: 'Citizen App',
          },
          {
            id: `evt-${Date.now()}-2`,
            status: 'Under Review',
            timestamp: nowIso,
            title: 'AI Verification Completed',
            notes: `AI classified as ${aiResult.category} with ${aiResult.severity} severity (Priority ${aiResult.priority}/10). Recommended action: ${aiResult.recommendedAction}`,
            actor: aiResult.modelUsed || 'CleanCity AI Engine',
          },
        ],
      };

      onReportCreated(newReport);
      setSubmittedReport(newReport);
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ form: 'An unexpected error occurred while processing the report. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setAnalysisStatus('');
    }
  };

  const handleResetForm = () => {
    setSubmittedReport(null);
    setPhotoUrl('');
    setPhotoBase64('');
    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedCategory('Auto-detect with AI');
    setReporterName('');
    setCoordinates(undefined);
    setErrors({});
  };

  // Success Confirmation Screen
  if (submittedReport) {
    const priorityColor =
      submittedReport.priority >= 8
        ? 'bg-rose-100 text-rose-800 border-rose-200'
        : submittedReport.priority >= 6
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200';

    return (
      <div id="report-success-screen" className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm uppercase tracking-wider font-semibold text-emerald-100">
                Ticket Dispatched to Ward 4 Crews
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ticket ID: <span className="font-mono">{submittedReport.id}</span>
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              Thank you for keeping our neighborhood clean! CleanCity AI has prioritized this ticket and dispatched it to the Ward 4 response queue.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* AI Analysis Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-zinc-900 text-base">
                    AI Classification & Priority Assessment
                  </h3>
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  Automated by CleanCity AI
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-xs font-medium text-zinc-500 block mb-1">Category</span>
                  <span className="text-sm font-bold text-zinc-900">{submittedReport.category}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-xs font-medium text-zinc-500 block mb-1">Severity Level</span>
                  <span className="text-sm font-bold text-zinc-900">{submittedReport.severity}</span>
                </div>
                <div className={`p-3 rounded-lg border ${priorityColor}`}>
                  <span className="text-xs font-medium block mb-1 opacity-80">Calculated Priority</span>
                  <span className="text-sm font-bold">{submittedReport.priority} / 10 Score</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-zinc-700 block mb-0.5">AI Summary:</span>
                  <p className="text-zinc-600">{submittedReport.aiSummary}</p>
                </div>
                <div>
                  <span className="font-semibold text-zinc-700 block mb-0.5">Recommended Municipal Action:</span>
                  <p className="text-emerald-900 bg-emerald-50/80 p-2.5 rounded-md border border-emerald-200">
                    {submittedReport.recommendedAction}
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Details Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-600">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-zinc-900 block">Location:</span>
                  <span>{submittedReport.location}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-zinc-900 block">Submitted At:</span>
                  <span>{new Date(submittedReport.submittedAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-zinc-900 block">Current Status:</span>
                  <span className="font-semibold text-emerald-700">{submittedReport.status}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              <button
                id="btn-view-tracker"
                onClick={() => onNavigateToTracker(submittedReport.id)}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <span>Track This Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="btn-submit-another"
                onClick={handleResetForm}
                className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Submit Another Issue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Report Submission Form
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Title & Context */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Citizen Dispatch & Smart Triage</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Report a Sanitation Issue
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          Upload photo evidence, describe the problem, and pin the location. Our automated triage engine will categorize the waste, calculate urgency, and dispatch field crews.
        </p>
      </div>

      {/* Quick Demo Presets Bar */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Click Real Neighborhood Scenarios for Live Demos:</span>
          </span>
          <span className="text-[11px] text-emerald-700">
            Click any scenario to auto-populate photo, description, & geo-location
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_PHOTOS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              id={`preset-${preset.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => applyPreset(preset)}
              className="text-left px-3 py-2 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-medium text-zinc-800 transition-colors cursor-pointer shadow-2xs hover:border-emerald-300"
            >
              <div className="font-semibold text-emerald-950 truncate">{preset.label}</div>
              <div className="text-[11px] text-zinc-500 truncate">{preset.cat}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 sm:p-8 space-y-6">
        {errors.form && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* 1. Photo Upload / Evidence */}
        <div>
          <label className="block text-sm font-bold text-zinc-900 mb-1.5">
            1. Photo of the Issue <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-zinc-500 mb-3">
            Upload an image from your device, drag-and-drop, or use one of the 1-click presets above.
          </p>

          {photoUrl ? (
            <div className="relative rounded-xl border-2 border-emerald-300 overflow-hidden bg-zinc-950 group">
              <img
                src={photoUrl}
                alt="Sanitation issue preview"
                className="w-full h-64 sm:h-72 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                <button
                  type="button"
                  id="btn-remove-photo"
                  onClick={() => {
                    setPhotoUrl('');
                    setPhotoBase64('');
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md hover:bg-rose-700 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md">
                Photo Attached & Ready for AI Analysis
              </div>
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-xl p-6 sm:p-8 text-center transition-colors bg-zinc-50/60">
              <input
                type="file"
                id="photo-file-input"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-zinc-800 mb-1">
                  Click to browse photo or drag & drop here
                </p>
                <p className="text-xs text-zinc-500">
                  Supports JPG, PNG, WebP up to 8MB
                </p>
              </div>
            </div>
          )}
          {errors.photo && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.photo}</span>
            </p>
          )}
        </div>

        {/* 2. Issue Title (Optional) */}
        <div>
          <label htmlFor="issue-title" className="block text-sm font-bold text-zinc-900 mb-1.5">
            2. Issue Title <span className="text-xs font-normal text-zinc-500">(Optional — AI will auto-title if blank)</span>
          </label>
          <input
            id="issue-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Overflowing dumpster blocking crosswalk on 5th Ave"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-zinc-900 bg-white"
          />
        </div>

        {/* 3. Issue Description */}
        <div>
          <label htmlFor="issue-description" className="block text-sm font-bold text-zinc-900 mb-1.5">
            3. Issue Description <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-zinc-500 mb-2">
            Detail the waste condition, quantity, odors, hazards, or obstruction. CleanCity AI analyzes this for priority scoring.
          </p>
          <textarea
            id="issue-description"
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.description;
                  return copy;
                });
              }
            }}
            placeholder="Describe what waste is present, how long it has been accumulating, whether it smells, attracts rodents, or blocks pedestrians/traffic..."
            className={`w-full px-3.5 py-2.5 rounded-lg border ${
              errors.description ? 'border-rose-400 focus:ring-rose-500' : 'border-zinc-300 focus:ring-emerald-500'
            } focus:outline-none focus:ring-2 text-sm text-zinc-900 bg-white`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-xs text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.description}</span>
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-zinc-400">{description.length} characters</span>
          </div>
        </div>

        {/* 4. Location & GPS */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="issue-location" className="block text-sm font-bold text-zinc-900">
              4. Location / Street Address <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              id="btn-detect-gps"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              {isLocating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isLocating ? 'Detecting...' : 'Detect GPS Location'}</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="issue-location"
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.location;
                    return copy;
                  });
                }
              }}
              placeholder="e.g. Corner of Elmwood Ave & 4th Street, Downtown Ward 2"
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border ${
                errors.location ? 'border-rose-400 focus:ring-rose-500' : 'border-zinc-300 focus:ring-emerald-500'
              } focus:outline-none focus:ring-2 text-sm text-zinc-900 bg-white`}
            />
          </div>
          {errors.location && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.location}</span>
            </p>
          )}

          {/* Quick Location Pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] text-zinc-500 mr-1 self-center">Presets:</span>
            {[
              'Central Metro Exit 2',
              '450 Market Street',
              'Riverside Community Park',
              'Greenwood Lane Plot 14',
              'Civic Town Plaza',
            ].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className="text-[11px] px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors cursor-pointer"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Category Selector & Reporter Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="issue-category-select" className="block text-sm font-bold text-zinc-900 mb-1.5">
              5. Category Selection
            </label>
            <select
              id="issue-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-zinc-900 bg-white"
            >
              <option value="Auto-detect with AI">✨ Auto-detect with AI (Recommended)</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reporter-name" className="block text-sm font-bold text-zinc-900 mb-1.5">
              6. Reporter Name / Alias <span className="text-xs font-normal text-zinc-500">(Optional)</span>
            </label>
            <input
              id="reporter-name"
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="e.g. Arjun M. (or leave blank for Anonymous)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-zinc-900 bg-white"
            />
          </div>
        </div>

        {/* Submit Button & AI Indicator */}
        <div className="pt-4 border-t border-zinc-200">
          <button
            type="submit"
            id="btn-submit-report"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-base shadow-md shadow-emerald-200 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{analysisStatus || 'Analyzing & Filing Report...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze with AI & Submit Report</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-zinc-500 mt-2">
            AI layer automatically categorizes issue, computes severity (1-10), generates dispatch advice, and creates a tracked record.
          </p>
        </div>
      </form>
    </div>
  );
};
