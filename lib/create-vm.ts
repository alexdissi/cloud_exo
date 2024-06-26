import exp from "node:constants";

const util = require("util");
const {
    ClientSecretCredential,
    DefaultAzureCredential,
} = require("@azure/identity");
const { ComputeManagementClient } = require("@azure/arm-compute");
const { ResourceManagementClient } = require("@azure/arm-resources");
const { StorageManagementClient } = require("@azure/arm-storage");
const { NetworkManagementClient } = require("@azure/arm-network");

// Store function output to be used elsewhere
let randomIds = {};
let subnetInfo = null;
let publicIPInfo = null;
let vmImageInfo = null;
let nicInfo = null;

// CHANGE THIS - used as prefix for naming resources
const yourAlias = "devc";

// CHANGE THIS - used to add tags to resources
const projectName = "projecttestalexandre";

// Resource configs
const location = "North Europe";
const accType = "Standard_LRS";

// Ubuntu config for VM
const randomNumbers = Math.floor(Math.random() * 90000) + 10000;

const adminUsername = "admin" + randomNumbers as string;
const adminPassword = "Pa$$w0rd" + randomNumbers as string;


// Azure authentication in environment variables for DefaultAzureCredential
const tenantId =
    process.env["AZURE_TENANT_ID"] || "REPLACE-WITH-YOUR-TENANT-ID";
const clientId =
    process.env["AZURE_CLIENT_ID"] || "REPLACE-WITH-YOUR-CLIENT-ID";
const secret =
    process.env["AZURE_CLIENT_SECRET"] || "REPLACE-WITH-YOUR-CLIENT-SECRET";
const subscriptionId =
    process.env["AZURE_SUBSCRIPTION_ID"] || "REPLACE-WITH-YOUR-SUBSCRIPTION_ID";

let credentials = null;

if (process.env.production) {
    // production
    credentials = new DefaultAzureCredential();
} else {
    // development
    credentials = new ClientSecretCredential(tenantId, clientId, secret);
    console.log("development");
}

// Azure services
const resourceClient = new ResourceManagementClient(
    credentials,
    subscriptionId
);
const computeClient = new ComputeManagementClient(credentials, subscriptionId);
const storageClient = new StorageManagementClient(credentials, subscriptionId);
const networkClient = new NetworkManagementClient(credentials, subscriptionId);

// Create resources then manage them (on/off)
export async function createResources(os_machine: string,sku: string, publisher:string) {
    let resourceGroupName;
    try {
       const result = await createResourceGroup();
        resourceGroupName = result.name;
        const accountInfo = await createStorageAccount();
        const vnetInfo = await createVnet();
        subnetInfo = await getSubnetInfo();
        publicIPInfo = await createPublicIP();
        nicInfo = await createNIC(subnetInfo, publicIPInfo);
        const nicResult = await getNICInfo();
        const vmInfo = await createVirtualMachine(nicInfo.id, os_machine,sku,publisher);
        return { resourceGroupName,adminUsername,adminPassword};
    } catch (err) {
        console.log(err);
    }
}

async function createResourceGroup() {
    console.log("\n1.Creating resource group: " + resourceGroupName);
    const groupParameters = {
        location: location,
        tags: { project: projectName },
    };
    const resCreate = await resourceClient.resourceGroups.createOrUpdate(
        resourceGroupName,
        groupParameters
    );
    return resCreate;
}

async function createStorageAccount() {
    console.log("\n2.Creating storage account: " + storageAccountName);
    const createParameters = {
        location: location,
        sku: {
            name: accType,
        },
        kind: "Storage",
        tags: {
            project: projectName,
        },
    };
    return await storageClient.storageAccounts.beginCreateAndWait(
        resourceGroupName,
        storageAccountName,
        createParameters
    );
}

async function createVnet() {
    console.log("\n3.Creating vnet: " + vnetName);
    const vnetParameters = {
        location: location,
        addressSpace: {
            addressPrefixes: ["10.0.0.0/16"],
        },
        dhcpOptions: {
            dnsServers: ["10.1.1.1", "10.1.2.4"],
        },
        subnets: [{ name: subnetName, addressPrefix: "10.0.0.0/24" }],
    };
    return await networkClient.virtualNetworks.beginCreateOrUpdateAndWait(
        resourceGroupName,
        vnetName,
        vnetParameters
    );
}

async function getSubnetInfo() {
    console.log("\nGetting subnet info for: " + subnetName);
    const getResult = await networkClient.subnets.get(
        resourceGroupName,
        vnetName,
        subnetName
    );
    return getResult;
}

async function createPublicIP() {
    console.log("\n4.Creating public IP: " + publicIPName);
    const publicIPParameters = {
        location: location,
        publicIPAllocationMethod: "Dynamic",
        dnsSettings: {
            domainNameLabel: domainNameLabel,
        },
    };
    return await networkClient.publicIPAddresses.beginCreateOrUpdateAndWait(
        resourceGroupName,
        publicIPName,
        publicIPParameters
    );
}

async function createNIC(subnetInfo, publicIPInfo) {
    console.log("\n5.Creating Network Interface: " + networkInterfaceName);
    const nicParameters = {
        location: location,
        ipConfigurations: [
            {
                name: ipConfigName,
                privateIPAllocationMethod: "Dynamic",
                subnet: subnetInfo,
                publicIPAddress: publicIPInfo,
            },
        ],
    };
    return await networkClient.networkInterfaces.beginCreateOrUpdateAndWait(
        resourceGroupName,
        networkInterfaceName,
        nicParameters
    );
}

async function getNICInfo() {
    return await networkClient.networkInterfaces.get(
        resourceGroupName,
        networkInterfaceName
    );
}

async function createVirtualMachine(nicId, os_machine: string,sku, publisher:string) {
    const vmParameters = {
        location: location,
        osProfile: {
            computerName: vmName,
            adminUsername: adminUsername,
            adminPassword: adminPassword,
        },
        hardwareProfile: {
            vmSize: "Standard_B1ls",
        },
        storageProfile: {
            imageReference: {
                publisher: publisher,
                offer: os_machine,
                sku: sku,
                version: "latest",
            },
            osDisk: {
                name: osDiskName,
                caching: "None",
                createOption: "fromImage",
                vhd: {
                    uri:
                        "https://" +
                        storageAccountName +
                        ".blob.core.windows.net/nodejscontainer/osnodejslinux.vhd",
                },
            },
        },
        networkProfile: {
            networkInterfaces: [
                {
                    id: nicId,
                    primary: true,
                },
            ],
        },
    };
    console.log("6.Creating Virtual Machine: " + vmName);
    console.log(
        " VM create parameters: " + util.inspect(vmParameters, { depth: null })
    );
    const resCreate = await computeClient.virtualMachines.beginCreateOrUpdateAndWait(
        resourceGroupName,
        vmName,
        vmParameters
    );
    return await computeClient.virtualMachines.get(
        resourceGroupName,
        vmName
    );
}

const _generateRandomId = (prefix, existIds) => {
    var newNumber;
    while (true) {
        newNumber = prefix + Math.floor(Math.random() * 10000);
        if (!existIds || !(newNumber in existIds)) {
            break;
        }
    }
    return newNumber;
};

//Random number generator for service names and settings
const resourceGroupName = _generateRandomId(`${yourAlias}-testrg`, randomIds);
const vmName = (`${yourAlias}vm`);
const storageAccountName = _generateRandomId(`${yourAlias}ac`, randomIds);
const vnetName = _generateRandomId(`${yourAlias}vnet`, randomIds);
const subnetName = _generateRandomId(`${yourAlias}subnet`, randomIds);
const publicIPName = _generateRandomId(`${yourAlias}pip`, randomIds);
const networkInterfaceName = _generateRandomId(`${yourAlias}nic`, randomIds);
const ipConfigName = _generateRandomId(`${yourAlias}crpip`, randomIds);
const domainNameLabel = _generateRandomId(`${yourAlias}domainname`, randomIds);
const osDiskName = _generateRandomId(`${yourAlias}osdisk`, randomIds);


