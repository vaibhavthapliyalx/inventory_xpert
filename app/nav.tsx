import Navbar from './navbar';
// import { auth } from './auth';

export default function Nav() {
  // const session = await auth();
  // return <Navbar user={session?.user} />;
  return (<Navbar user={undefined}/>)
}