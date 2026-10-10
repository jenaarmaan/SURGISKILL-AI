import React from 'react';
import {
  HelpCircle,
  BookOpen,
  FileCheck,
  Shield,
  Layers,
  Award,
  Video,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../components/common/Badge.tsx';

export const HelpReferenceView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Badge status="INFO" size="sm">CLINICAL REFERENCE STANDARDS</Badge>
          <span className="text-xs text-slate-400">ACS / APDS / RCS Guidelines</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
          Surgical Skills Intelligence Manual & Standards
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Core technical competencies, computer vision measurement definitions, and validation principles for surgical educators.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Measurement Principles */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <BookOpen className="h-5 w-5" />
            <span>1. Objective Metric Definitions</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <h4 className="font-bold text-white text-sm">Bite Width (Entry / Exit Margin)</h4>
              <p className="text-slate-400 leading-relaxed">
                The perpendicular distance from the needle entry puncture to the incised wound margin. Target is <strong>4.0 mm ± 0.8 mm</strong>. Bites under 3.0mm risk tissue tear under tension (dehiscence); bites over 5.0mm strangulate vascular microcirculation causing ischemic edge necrosis.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <h4 className="font-bold text-white text-sm">Orthogonal Needle Entry (90°)</h4>
              <p className="text-slate-400 leading-relaxed">
                The initial orientation of the needle shaft relative to the epidermal plane. Maintaining <strong>85° - 95°</strong> forces tissue outward, creating anatomical edge eversion. Tangential entries under 80° invert edges, predisposing to delayed healing and hypertrophic scarring.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <h4 className="font-bold text-white text-sm">Inter-Stitch Spacing (Pitch)</h4>
              <p className="text-slate-400 leading-relaxed">
                The longitudinal distance between adjacent suture throws. Target is <strong>5.0 mm ± 1.0 mm</strong>. Uniform spacing ensures equalized tension distribution along the entire wound length without focal ischemia.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <h4 className="font-bold text-white text-sm">Kinematic Economy of Motion</h4>
              <p className="text-slate-400 leading-relaxed">
                The cumulative spatial distance traveled by instrument tips. PGY-2 expert benchmark is <strong>&lt; 65 cm</strong> for a standard 4-stitch simple interrupted closure. Lower path length reflects pre-planned trajectories without hesitations.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Sensory Modality & Depth Transparency */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Shield className="h-5 w-5" />
            <span>2. Transparent Sensory Modalities & Proxies</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            In accordance with clinical safety principles, SurgiSkill AI never fabricates sensor measurements:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>
              <strong>Monocular Cameras (RGB):</strong> When using standard 2D webcams, wound depth and suture tension are explicitly tagged as <em>Visual Proxies</em> derived from planar geometry and apposition markers.
            </li>
            <li>
              <strong>Calibrated Stereo / Depth Sensors (e.g. Intel RealSense):</strong> Metric Z-depth values are only recorded when active hardware depth registration is verified.
            </li>
            <li>
              <strong>Tension Transducers (e.g. ATI Loadcells):</strong> Physical tissue pull force in Newtons is only displayed when hardware serial calibration is confirmed.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
