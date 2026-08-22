'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../../services/store';
import { ResourceVisualEditor } from '../../../features/admin/components/ResourceVisualEditor';

export default function NewResourcePage() {
  const store = useAppStore();
  const router = useRouter();

  const handleSave = (resourceData: any) => {
    store.addResource(resourceData);
    router.push('/admin');
  };

  return <ResourceVisualEditor initialResource={null} onSave={handleSave} />;
}
