import { Ship, Plane, Truck, ArrowRight } from 'lucide-react';
import type { Shipment } from '../../data/types';
import { Badge } from '../ui/Badge';

interface ShipmentHeaderProps {
  shipment: Shipment;
}

const statusBadge: Record<Shipment['status'], { label: string; variant: 'resolved' | 'warning' | 'critical' }> = {
  'on-track': { label: 'On Track', variant: 'resolved' },
  'at-risk':  { label: 'At Risk',  variant: 'warning' },
  blocked:    { label: 'Blocked',  variant: 'critical' },
};

const modeIcon: Record<Shipment['mode'], React.ElementType> = {
  ocean: Ship,
  air:   Plane,
  road:  Truck,
};

export function ShipmentHeader({ shipment }: ShipmentHeaderProps) {
  const badge = statusBadge[shipment.status];
  const ModeIcon = modeIcon[shipment.mode];

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-base font-semibold text-white">{shipment.id}</span>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Carrier row */}
      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
        <ModeIcon size={14} className="text-neutral-600" />
        <span>{shipment.carrier}</span>
        <span className="text-neutral-700">|</span>
        <span className="font-medium text-neutral-300">{shipment.vessel}</span>
        <span className="text-neutral-700">|</span>
        <span>Voyage {shipment.voyage}</span>
      </div>

      {/* Lane visualization */}
      <div className="mt-3 flex items-center justify-between rounded-lg bg-neutral-800/60 border border-neutral-700/50 px-4 py-3">
        <div className="text-center">
          <p className="text-base font-bold text-white">{shipment.origin.port}</p>
          <p className="mt-0.5 text-[10px] text-neutral-500">
            {shipment.origin.city}, {shipment.origin.country}
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="h-px flex-1 bg-neutral-700" />
          <ArrowRight size={14} className="mx-2 text-neutral-600" />
          <div className="h-px flex-1 bg-neutral-700" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-white">{shipment.destination.port}</p>
          <p className="mt-0.5 text-[10px] text-neutral-500">
            {shipment.destination.city}, {shipment.destination.country}
          </p>
        </div>
      </div>

      {/* Info grid */}
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5">
        {[
          { label: 'PO Reference', value: shipment.poId, mono: false },
          { label: 'Container',    value: shipment.container, mono: true },
          { label: 'Cargo',        value: shipment.cargoDescription, mono: false },
          { label: 'Weight',       value: shipment.cargoWeight, mono: false },
        ].map(({ label, value, mono }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">{label}</p>
            <p className={`mt-0.5 text-xs font-medium text-neutral-300 ${mono ? 'font-mono' : ''}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
