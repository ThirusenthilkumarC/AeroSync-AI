import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center font-body-md text-on-surface">
      <div className="max-w-md w-full p-8 rounded-3xl bg-surface-container-lowest border border-surface-container-highest shadow-xl space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-error-container/60 text-error flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-label-code text-xs font-bold text-error uppercase tracking-wider">
            ERROR 404 • FLIGHT VECTOR LOST
          </span>
          <h1 className="font-headline-xl text-3xl font-extrabold text-on-surface">
            Wayward Waypoint
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
            The flight path or telemetry sector you are attempting to access does not exist or has been rerouted by OCC dispatch.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-label-code text-xs">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary font-bold shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-secondary-container" />
            <span>Mission Control</span>
          </button>
        </div>

      </div>
    </div>
  );
}
