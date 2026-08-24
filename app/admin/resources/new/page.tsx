'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ResourceItem } from '../../../types';
import { useAppStore } from '../../../services/store';
import { ResourceVisualEditor } from '../../../features/admin/components/ResourceVisualEditor';

export default function NewResourcePage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    <ResourceVisualEditor
      onSave={(data) => {
        store.addResource(data as unknown as Partial<ResourceItem> & { title: string });
        router.push('/admin?tab=resources');
      }}
    />
  );
}
