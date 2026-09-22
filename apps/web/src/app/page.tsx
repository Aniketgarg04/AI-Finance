import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect the root page to the professional dashboard/login flow
  redirect('/login');
}
