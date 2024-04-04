import {createResources} from "@/lib/create-vm";
import {NextResponse} from "next/server";
import {deleteResourceGroup} from "@/lib/delete-vm";
import {getServerSession} from "next-auth";
import authOptions from "@/lib/authOptions";
interface resourceGroupName {
    resourceGroupName: string;
    adminUsername: string;
    adminPassword: string;
}

let resourceGroupName: resourceGroupName;
export async function POST(req: Request) {
    // Get the session
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" });
    }

    // Get the param value from the request body
    const os = await JSON.parse(await req.text())
    const paramValue = os.param

    // Create the resource group based on the param value
    if (paramValue === "debian-12") {
        resourceGroupName = await createResources("debian-12", "12", "Debian");
    } else if (paramValue === "UbuntuServer") {
        resourceGroupName = await createResources("UbuntuServer", "16.04.0-LTS", "Canonical");
    } else if (paramValue === "WindowsServer") {
        resourceGroupName = await createResources("WindowsServer", "2016-Datacenter", "MicrosoftWindowsServer");
    }

    // Return the resource group name
    return NextResponse.json({ resourceGroupName})
}

// Delete the resource group
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)

    // Check if the session exists
if (!session) {
            return NextResponse.json({ error: "Unauthorized" });
}

        try {
            await deleteResourceGroup(resourceGroupName.resourceGroupName);

            resourceGroupName = null;

            return NextResponse.json({ message: "Resource group deleted successfully" });
        } catch (error) {
            console.error("Error:", error);
            return NextResponse.json({ error: "An error occurred while deleting the resource group." });
        }
}

