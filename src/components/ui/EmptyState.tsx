import type { ReactNode } from 'react';
import { ImageIcon } from './icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-20 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-zinc-500">
        {icon ?? <ImageIcon size={24} />}
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-zinc-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
