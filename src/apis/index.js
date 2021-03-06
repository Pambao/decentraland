import { create } from "ipfs-http-client";

const filterNumericKeys = (obj) => {
    return _.pickBy(obj, (_val, key) => isNaN(key));
};

const getLandSpecifications = async (hash) => {
    const IPFS_BASE_URL = "https://ipfs.infura.io/ipfs/";
    const response = await fetch(`${IPFS_BASE_URL}${hash}`);
    const { center, area, paths } = await response.json();
    return { center, area, paths };
};

export const getLands = async (contract) => {
    const landsCount = await contract.methods.getLandCount().call();
    const lands = [];
    for (let i = 1; i <= landsCount; i++) {
        const land = await contract.methods.getLand(i).call();
        const { center, area, paths } = await getLandSpecifications(
            land.landCoordinatorHash
        );
        const optimizedLand = filterNumericKeys(land);
        lands.push({ ...optimizedLand, center, area, paths });
    }
    return lands;
};

export const getLand = async (contract, id) => {
    const land = await contract.methods.getLand(id).call();
    const { center, area, paths } = await getLandSpecifications(
        land.landCoordinatorHash
    );
    const optimizedLand = filterNumericKeys(land);
    return { ...optimizedLand, center, area, paths };
};

export const getLandTransactions = async (contract, landId) => {
    const transactions = await contract.methods.getLandTrxs(landId).call();
    return transactions.map((transaction) => filterNumericKeys(transaction));
};

export const postLand = async (contract, description, hash, sender) => {
    const uploadResult = await contract.methods
        .publishLand(description, hash)
        .send({ from: sender });
    const newLand = uploadResult.events.LandPublished.returnValues;
    const { center, area, paths } = await getLandSpecifications(
        newLand.landCoordinatorHash
    );
    const optimizedLand = filterNumericKeys(newLand);
    return { ...optimizedLand, center, area, paths };
};

export const postIpfs = async (file) => {
    const ipfs = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
    });
    let result;
    try {
        result = await ipfs.add(file);
        console.log(result);
    } catch (e) {
        console.error(e);
    }
    return result;
};

export const postCitizen = async (
    contract,
    idNumber,
    fullName,
    gender,
    dob,
    sender
) => {
    return contract.methods
        .publishCitizen(idNumber, fullName, gender, dob)
        .send({ from: sender });
};

export const getCitizens = async (contract) => {
    const citizensCount = await contract.methods.getCitizenCount().call();
    const citizens = [];
    for (let i = 1; i <= citizensCount; i++) {
        const citizen = await contract.methods.getCitizen(i).call();
        citizens.push(filterNumericKeys(citizen));
    }
    return citizens;
};

export const getCitizenByIdNumber = async (contract, idNumber) => {
    const citizen = await contract.methods
        .getCitizenByIdNumber(idNumber)
        .call();
    return filterNumericKeys(citizen);
};

export const getCitizen = async (contract, id) => {
    const citizen = await contract.methods.getCitizen(id).call();
    return filterNumericKeys(citizen);
};

export const getCitizenOwnedLandTrxs = async (contract, id) => {
    const transactions = await contract.methods.getCitizenOwnedTrxs(id).call();
    return transactions.map((transaction) => filterNumericKeys(transaction));
};

export const transferLand = async (contract, landId, citizenId, sender) => {
    return contract.methods
        .transferLand(landId, citizenId)
        .send({ from: sender });
};

export const getAdmins = async (contract) => {
    const adminCount = await contract.methods.getAdminCount().call();
    const admins = [];
    for (let i = 1; i <= adminCount; i++) {
        const admin = await contract.methods.getAdmin(i).call();
        admins.push(filterNumericKeys(admin));
    }
    return admins;
};

export const getAdmin = async (contract, id) => {
    const admin = await contract.methods.getAdmin(id).call();
    return filterNumericKeys(admin);
};

export const postAdmin = async (contract, title, address, sender) => {
    return contract.methods.publishAdmin(title, address).send({ from: sender });
};

export const getAdminByAddress = async (contract, address) => {
    const admin = await contract.methods.getAdminByAddress(address).call();
    return filterNumericKeys(admin);
};

export const checkIsContractOwner = async (contract, sender) => {
    return contract.methods.checkIsContractOwner(sender).call();
};
