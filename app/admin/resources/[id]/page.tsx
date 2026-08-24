'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ResourceItem } from '../../../types';
import { useAppStore } from '../../../services/store';
import { ResourceVisualEditor } from '../../../features/admin/components/ResourceVisualEditor';
import { EditorNotFound } from '../../../features/admin/components/EditorShell';

export default function EditResourcePage() {
  const store = useAppStore();
  const router = useRouter();
  const params = useParams();
  const resourceId = params?.id as string;

  const resource = store.resources.find((r) => r.id === resourceId);

  if (!resource) return <EditorNotFound label="Resource" backTab="resources" />;

  return (
    <ResourceVisualEditor
      initialResource={resource}
      onSave={(data) => {
        store.updateResource(resource.id, data as unknown as Partial<ResourceItem>);
        router.push('/admin?tab=resources');
      }}
    />
  );
}
