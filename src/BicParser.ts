import AdmZip from "adm-zip";
import iconv from "iconv-lite";
import {DOMParser} from "xmldom";
import fetch from 'node-fetch';


export async function collectDataFromUri(uri: string): Promise<ArrayBuffer> {
    const response = await fetch(uri);
    return await response.arrayBuffer()
}

export async function unpackArchive(data: ArrayBuffer): Promise<[filename: String, fileData: string][]> {
    if (data.byteLength <= 0)
        return [];
    const archive = new AdmZip(Buffer.from(data));
    const readAsTextAsync = (entry: AdmZip.IZipEntry) => new Promise<Buffer | null>((resolve, reject) => {
        archive.readFileAsync(entry, (data, error) => {
            if (error)
                reject(error);
            else
                resolve(data);
        })
    });
    const result = await Promise.all(archive.getEntries().map(async entry => [entry.entryName, await readAsTextAsync(entry)]));
    return result.filter(x => x[1]).map(x => [(x[0] as string), iconv.decode(x[1] as Buffer, 'windows1251')]);
}

export async function parseAccounts(document: Document): Promise<Account[]> {
    const bicDirectoryEntries = Array.from(document.getElementsByTagName('BICDirectoryEntry'))
    return bicDirectoryEntries
        .flatMap(directory => {
            const bic: string = directory.getAttribute('BIC') as string,
                participantInfo = directory.getElementsByTagName('ParticipantInfo');
            if (participantInfo.length <= 0)
                throw new Error("Element 'ParticipantInfo' is missing from 'BICDirectoryEntry' element")
            const
                name: string = participantInfo[0].getAttribute('NameP') as string,
                accounts: Element[] = Array.from(directory.getElementsByTagName('Accounts'));

            return accounts.map(account => new Account(bic, name, account.getAttribute('Account') as string))
        });
}

export async function getAccountsFromUri(uri: string): Promise<Account[]> {
    const data = await collectDataFromUri(uri);
    const files = await unpackArchive(data);
    const parser = new DOMParser();
    const parsedAccounts = files.map(async file =>
        await parseAccounts(
            parser.parseFromString(file[1])
        )
    );
    return (await Promise.all(parsedAccounts)).flat();
}

export class Account {
    bic: string;
    name: string;
    corrAccount: string;

    constructor(bic: string, name: string, corrAccount: string) {
        this.bic = bic;
        this.name = name;
        this.corrAccount = corrAccount;
    }
}