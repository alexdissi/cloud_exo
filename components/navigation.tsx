import {signIn, signOut, useSession} from "next-auth/react";
import {ConfirmedUser} from "@/interface/User";
export default function Navigation() {
    const {data: session} = useSession()
    const user = session?.user as  ConfirmedUser
    return (
        <nav className={"flex flex-row justify-between items-center mx-6 p-5"}>
            <div>
                <h1 className={"text-3xl font-bold"}>Cloud Mastere Dev C</h1>
            </div>
            <div>
                {session ? (
                    <div className={"flex flex-row items-center gap-5"}>
                        <h1>Welcome {user.email}</h1>
                        <h2>Role: {user.role}</h2>
                        <button className={"btn btn-error"} onClick={() => signOut()}>Sign out</button>
                    </div>) : (
                    <>
                        <button className={"btn btn-primary"} onClick={() => signIn()}>Sign in</button>
                    </>
                )}
            </div>
        </nav>
    );
}