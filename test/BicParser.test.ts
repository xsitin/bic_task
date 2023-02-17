import {describe, expect, it} from "@jest/globals";
// @ts-ignore
import AdmZip from "adm-zip";
import {Account, parseAccounts, unpackArchive} from '../src/BicParser';
import {DOMParser} from "xmldom";

describe('unpackArchive', () => {

    it('should handle an empty archive', async () => {
        const data = new ArrayBuffer(0);
        const result = await unpackArchive(data);
        expect(result).toHaveLength(0);
    });

    it('should handle an archive with a single file', async () => {
        const zip = new AdmZip();
        zip.addFile('file.txt', Buffer.from('hello world'));
        const data = zip.toBuffer();
        const result = await unpackArchive(data);
        expect(result).toHaveLength(1);
        expect(result[0][0]).toBe('file.txt');
        expect(result[0][1]).toBe('hello world');
    });

    it('should handle an archive with multiple files', async () => {
        const zip = new AdmZip();
        zip.addFile('file1.txt', Buffer.from('hello'));
        zip.addFile('file2.txt', Buffer.from('world'));
        const data = zip.toBuffer();
        const result = await unpackArchive(data);
        expect(result).toHaveLength(2);
        expect(result[0][0]).toBe('file1.txt');
        expect(result[0][1]).toBe('hello');
        expect(result[1][0]).toBe('file2.txt');
        expect(result[1][1]).toBe('world');
    });

    it('should handle an archive with binary data', async () => {
        const zip = new AdmZip();
        zip.addFile('file.bin', Buffer.from(new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05])));
        const data = zip.toBuffer();
        const result = await unpackArchive(data);
        expect(result).toHaveLength(1);
        expect(result[0][0]).toBe('file.bin');
        expect(result[0][1]).toBe(String.fromCharCode(0x00, 0x01, 0x02, 0x03, 0x04, 0x05));
    });
});
describe('parseAccounts', function () {
    it('should parse BICDirectoryEntry with ParticipantInfo and Accounts', async function () {
        const document = new DOMParser().parseFromString(`
  <BICDirectoryEntry BIC="AAAAA">
    <ParticipantInfo NameP="Bank A"/>
    <Accounts Account="123456"/>
    <Accounts Account="789012"/>
  </BICDirectoryEntry>
  `, "application/xml");

        const expectedOutput = [new Account("AAAAA", "Bank A", "123456"), new Account("AAAAA", "Bank A", "789012"),];

        const actualOutput = await parseAccounts(document);
        expect(actualOutput).toEqual(expectedOutput);

    });
    it('should parse valid BICDirectoryEntry element with empty Accounts', async function () {
        const document = new DOMParser().parseFromString(
            `
  <BICDirectoryEntry BIC="AAAAA">
    <ParticipantInfo NameP="Bank A"/>
  </BICDirectoryEntry>
  `,
            "application/xml"
        );

        const expectedOutput: Account[] = [];

        const actualOutput = await parseAccounts(document);
        expect(actualOutput).toEqual(expectedOutput);

    });

    it('should parse valid BICDirectoryEntry element with no Accounts', async function () {
        const document = new DOMParser().parseFromString(
            `
  <BICDirectoryEntry BIC="AAAAA">
    <ParticipantInfo NameP="Bank A"/>
  </BICDirectoryEntry>
  `,
            "application/xml"
        );

        const expectedOutput: Account[] = [];

        const actualOutput = await parseAccounts(document);
        expect(actualOutput).toEqual(expectedOutput);

    });
    it('should Parse valid BICDirectoryEntry element with missing BIC attribute', async function () {
        const document = new DOMParser().parseFromString(
            `
  <BICDirectoryEntry>
    <ParticipantInfo NameP="Bank A"/>
    <Accounts>
      <Account Account="123456"/>
    </Accounts>
  </BICDirectoryEntry>
  `,
            "application/xml"
        );

        const expectedError = new Error("Attribute 'BIC' is missing from 'BICDirectoryEntry' element");

        try {
            await parseAccounts(document);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }

    });

    it('should Parse valid BICDirectoryEntry element with missing ParticipantInfo element', async function () {
        const document = new DOMParser().parseFromString(
            `
  <BICDirectoryEntry BIC="AAAAA">
      <Accounts Account="123456"/>
  </BICDirectoryEntry>
  `,
            "application/xml"
        );

        const expectedError = new Error("Element 'ParticipantInfo' is missing from 'BICDirectoryEntry' element");

        try {
            await parseAccounts(document);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }

    });
    it('should Parse valid BICDirectoryEntry element with missing Account element', async function () {
        const document = new DOMParser().parseFromString(
            `
  <BICDirectoryEntry BIC="AAAAA">
    <ParticipantInfo NameP="Bank A"/>
  </BICDirectoryEntry>
  `,
            "application/xml"
        );

        const expectedOutput: Account[] = [];

        const actualOutput = await parseAccounts(document);
        expect(actualOutput).toEqual(expectedOutput);

    });
});