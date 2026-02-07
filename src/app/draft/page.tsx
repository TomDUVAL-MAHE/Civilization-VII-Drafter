'use client';

import { useDraftController } from '@/features/draft/hooks/useDraftController';
import DraftView from '@/features/draft/ui/DraftView';

export default function DraftPage() {
  const controller = useDraftController();
  return <DraftView state={controller.state} derived={controller.derived} actions={controller.actions} />;
}
