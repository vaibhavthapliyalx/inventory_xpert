'use client';
import Navbar from './navbar';

export default function Nav() {

  // const session = await auth();
  // return <Navbar user={session?.user} />;
  return (<Navbar user={undefined}/>)
}
