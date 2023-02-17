import {getAccountsFromUri} from "./BicParser.js";


const uri = "http://www.cbr.ru/s/newbik"
console.log( await getAccountsFromUri(uri))