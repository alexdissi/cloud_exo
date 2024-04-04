import {useSession} from "next-auth/react";
import {FaDebian, FaUbuntu, FaWindows} from "react-icons/fa6";
import {ConfirmedUser} from "@/interface/User";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

export default function Virtual() {
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({});
    const [result, setResult] = useState(false);
    const [timer, setTimer] = useState(600);
    const router = useRouter();


    useEffect(() => {
        const countdown = setTimeout(() => {
            if (timer > 0) {
                setTimer(timer - 1);
            } else {
                clearInterval(countdown);
                handleTimerEnd();
            }
        }, 1000);
        return () => clearInterval(countdown);
    }, [timer]);

    const handleTimerEnd = async () => {
        await fetch("/api/vm", {
            method: "DELETE"
        });
        toast.success("La machine virtuelle a été supprimée avec succès");
        setCredentials({});
        setResult(false);
        router.refresh();
    };

    const handleStart = async (param) => {
        setLoading(true);
        try {
            const res = await fetch("/api/vm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ param })
            });
            setLoading(false);
            const data = await res.json();
            setCredentials(prevState => ({ ...prevState, [param]: {
                    username: data.resourceGroupName.adminUsername,
                    password: data.resourceGroupName.adminPassword
                }}));
            setResult(true);
            if (res.ok) {
                setTimer(600);
            }
        } catch (error) {
            console.error("Une erreur s'est produite lors de la création de la machine virtuelle :", error);
        }
    };

    const { data: session } = useSession();
    const user = session?.user as ConfirmedUser;
    return (
        <div className={"h-screen"}>
            {session ? (
                <>
                    <div className={"flex flex-row justify-between gap-5 mx-20 mt-20 text-center"}>
                        {user.role === "user" && (
                            <div className={"w-screen"}>
                                <h2 className={"text-center text-4xl mt-10"}>Upgrade votre compte pour acceder au
                                    VM</h2>
                            </div>
                        )}
                        {user.role === "freemium" && (
                            <div>
                                <FaDebian onClick={() => handleStart("debian-12")}
                                          className={"text-[15rem] text-rose-500 cursor-pointer"}/>
                                <h2>Debian</h2>
                                {credentials["debian-12"] && ( // Affichage des informations uniquement si les informations pour Debian existent
                                    <>
                                        <h2>Username: {credentials["debian-12"].username}</h2>
                                        <h2>Password: {credentials["debian-12"].password}</h2>
                                    </>
                                )}
                            </div>
                        )}
                        {user.role === "premium" && (
                            <>
                                <div>
                                    <FaDebian onClick={() => handleStart("debian-12")}
                                              className={"text-[15rem] text-rose-500 cursor-pointer"}/>
                                    <h2>Debian</h2>
                                    {credentials["debian-12"] && ( // Affichage des informations uniquement si les informations pour Debian existent
                                        <>
                                            <h2>Username: {credentials["debian-12"].username}</h2>
                                            <h2>Password: {credentials["debian-12"].password}</h2>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <FaUbuntu onClick={() => handleStart("UbuntuServer")}
                                              className={"text-[15rem] text-orange-500 cursor-pointer"}/>
                                    <h2>Ubuntu</h2>
                                    {credentials["UbuntuServer"] && (
                                        <>
                                            <h2>Username: {credentials["UbuntuServer"].username}</h2>
                                            <h2>Password: {credentials["UbuntuServer"].password}</h2>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <FaWindows onClick={() => handleStart("WindowsServer")}
                                               className={"text-[15rem] text-blue-500 cursor-pointer"}/>
                                    <h2>Windows</h2>
                                    {credentials["WindowsServer"] && (
                                        <>
                                            <h2>Username: {credentials["WindowsServer"].username}</h2>
                                            <h2>Password: {credentials["WindowsServer"].password}</h2>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <h1 className={"text-center mt-10 text-4xl"}>Veuillez vous connecter pour acceder a vos virtual
                        machine</h1>
                </>)}
            {loading && <div className={"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"}>
                <div className={"bg-white p-10 rounded-lg"}>
                    <h1 className={"text-2xl text-center text-black"}>Creation de la VM en cours<br/> Veuillez patienter
                        ...</h1>
                </div>
            </div>}

            {result && (
                <h2 className={"mt-20 text-red-600 text-5xl text-center "}>Attention vous avez 10 min avant que la VM ne soit detruit automatiquement</h2>
            )}
        </div>
    );
}
