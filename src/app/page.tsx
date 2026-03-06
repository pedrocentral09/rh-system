import { redirect } from 'next/navigation';

export default function Home() {
  // Default landing → employee portal login
  redirect('/login/colaborador');
}
