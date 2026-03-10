import { Ship, Plane, Truck, ArrowRight } from 'lucide-react';
import type { Shipment } from '../../data/types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface ShipmentHeaderProps {
  shipment: Shipment;
}

const statusBadge: Record<
  Shipment['status'],
  { label: string; variant: 'resolved' | 'warning' | 'critical' }
> = {
  'on-track': { label: 'On Track', variant: 'resolved' },
  'at-risk': { label: 'At Risk', variant: 'warning' },
  blocked: { label: 'Blocked', variant: 'critical' },
};

const modeIcon: Record<Shipment['mode'], React.ElementType> = {
  ocean: Ship,
  air: Plane,
  road: Truck,
};

export function ShipmentHeader({ shipment }: ShipmentHeaderProps) {
  const badge = statusBadge[shipment.status];
  const ModeIcon = modeIcon[shipment.mode];

  return (
    <Card>
      {/* Top row: Shipment ID + Status badge */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-semibold text-slate-900">
          {shipment.id}
        </span>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Carrier / Vessel row */}
      <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-600">
        <ModeIcon size={16} className="text-slate-400" />
        <span>{shipment.carrier}</span>
        <span className="text-slate-300">|</span>
        <span className="font-medium text-slate-700">{shipment.vessel}</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500">Voyage {shipment.voyage}</span>
      </div>

      {/* Lane visualization */}
      <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
        {/* Origin */}
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{shipment.origin.port}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {shipment.origin.city}, {shipment.origin.country}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="h-px flex-1 bg-slate-300" />
          <ArrowRight size={18} className="mx-1 text-slate-400" />
          <div className="h-px flex-1 bg-slate-300" />
        </div>

        {/* Destination */}
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{shipment.destination.port}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {shipment.destination.city}, {shipment.destination.country}
          </p>
        </div>
      </div>

      {/* Info grid */}
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            PO Reference
          </p>
          <p className="mt-0.5 font-medium text-slate-700">{shipment.poId}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Container
          </p>
          <p className="mt-0.5 font-mono font-medium text-slate-700">
            {shipment.container}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Cargo
          </p>
          <p className="mt-0.5 font-medium text-slate-700">
            {shipment.cargoDescription}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Weight
          </p>
          <p className="mt-0.5 font-medium text-slate-700">{shipment.cargoWeight}</p>
        </div>
      </div>
    </Card>
  );
}
