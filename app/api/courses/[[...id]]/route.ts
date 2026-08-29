import { canSeeCourse, redactCourse } from '../../../lib/access.ts';
import { crud, newId } from '../../../lib/api.ts';
import { collections, dehydrate, hydrate } from '../../../lib/db.ts';
import type { CourseDoc } from '../../../lib/db.ts';
import type { Course, Lesson } from '../../../types.ts';

/**
 * Lessons are embedded, so there are no lesson endpoints: adding, editing and
 * deleting one is a PATCH of the course's `lessons` array. lessonsCount and
 * totalHours are recomputed from it here and never accepted from the client.
 */
const routes = crud<Course, CourseDoc>({
  collection: collections.courses,
  permission: 'canManageCourses',
  idPrefix: 'c',
  toApp: hydrate.course,
  toDoc: dehydrate.course,
  normalize: (row, id) => {
    const thumbnailUrl = (row.thumbnailUrl ?? (row as { posterUrl?: string }).posterUrl ?? '').trim() || undefined;
    const lessons = (row.lessons ?? []).map((lesson, i) => ({
      ...lesson,
      id: lesson.id || newId('les'),
      courseId: id,
      order: lesson.order ?? i + 1,
      subject: ((lesson.subject as string) === 'reading_writing' ? 'reading_writing' : 'math') as Lesson['subject'],
    }));
    // Default lesson subject from course subject when lesson has no valid value (handled above).
    // Keep for backward-compat: if original had no subject and course is pure English, treat as English
    for (let idx = 0; idx < lessons.length; idx++) {
      const orig = (row.lessons ?? [])[idx] as { subject?: string } | undefined;
      if (!orig?.subject && row.subject === 'reading_writing') {
        (lessons[idx] as { subject: string }).subject = 'reading_writing';
      } else if (!orig?.subject && row.subject === 'both' && idx === 0) {
        // leave as math default; editor tabs handle reassignment
      }
    }
    const minutes = lessons.reduce((sum, l) => sum + (Number(l.durationMinutes) || 0), 0);
    return {
      ...(row as Course),
      id,
      slug: row.slug || (row.title ?? id).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      subject: row.subject ?? 'math',
      is_published: row.is_published ?? false,
      thumbnailUrl,
      posterUrl: thumbnailUrl,
      features: row.features ?? [],
      level: row.level ?? 'All Levels',
      price: row.price ?? 0,
      originalPrice: row.originalPrice ?? 0,
      lessons,
      lessonsCount: lessons.length,
      // Derived once there is anything to derive from; a course with no lessons
      // yet keeps whatever the author typed.
      totalHours: lessons.length ? Math.round((minutes / 60) * 10) / 10 : (row.totalHours ?? 0),
    };
  },
  // The catalog page needs every course listed, enrolled or not — the lesson
  // titles stay, the video URLs do not.
  visibleTo: (course, user) => (canSeeCourse(user, course.id) ? course : redactCourse(course)),
});

export const { GET, POST, PATCH, DELETE } = routes;
