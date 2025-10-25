import { revalidatePath } from 'next/cache';
import { hostLogout } from '@/app/actions';
import { firestore } from '@/lib/firebase-admin';
import { type RsvpWithId, type Rsvp } from '@/lib/types';
import { HostDashboardClient } from './host-dashboard-client';

async function getRsvps(): Promise<RsvpWithId[]> {
  const snapshot = await firestore.collection('rsvps').orderBy('submittedAt', 'desc').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({
    id: doc.id,
    submittedAt: doc.data().submittedAt.toDate(),
    ...(doc.data() as Rsvp),
  }));
}

export async function HostDashboard() {
  const rsvps = await getRsvps();

  async function handleLogout() {
    'use server';
    await hostLogout();
  }

  async function handleRefresh() {
    'use server';
    revalidatePath('/host');
  }

  return <HostDashboardClient rsvps={rsvps} onLogout={handleLogout} onRefresh={handleRefresh} />;
}
