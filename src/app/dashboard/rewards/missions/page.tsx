import { redirect } from 'next/navigation';

export default function MissionsRedirectPage() {
    redirect('/dashboard/rewards/catalog');
}
