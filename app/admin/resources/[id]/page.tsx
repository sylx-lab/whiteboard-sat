'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../../services/store';
import { ResourceVisualEditor } from '../../../features/admin/components/ResourceVisualEditor';

export default function EditResourcePage() {
  const store = useAppStore();
  const router = useRouter();
  const params = useParams();
  const resId = params?.id as string;

  const existingResource = store.resources.find((r) => r.id === resId) || null;

  const handleSave = (resourceData: any) => {
    if (existingResource) {
      store.updateResource(existingResource.id, resourceData);
    } else {
      store.addResource(resourceData);
    }
    router.push('/admin');
  };

  return <ResourceVisualEditor initialResource={existingResource} onSave={handleSave} />;
}
