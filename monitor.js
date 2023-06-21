// Author: Jean-Marie Thewes

//Modules:
const fs = require("fs").promises;
const nodemailer = require("nodemailer");

const config = require("./config.js");
const log = require("./log.js");
const almaPrint = require("./alma-print.js");

//Global vars:
const debug=false;
const resultLimit = 100;
const configFileName = "config/config.json";
const defaultLogFile = "log/default.log";
const dataFile = "data/data.json";

var transporter

//Environment vars:
process.env.configFileName = configFileName;
process.env.defaultLogFile = defaultLogFile;

//Functions:

async function initMailer(){
    if(config.getMailEnabled()){
        transporter = nodemailer.createTransport({
            host: await config.getMailServer(),
            port: await config.getMailPort(),
            secure: false
        });
    }
}//------------------------------------------------------------------------------------------

function reportAndClose(error){
    //console.log(error)
    if("message" in error){
        log.error(`${error.name}: ${error.message}`);
        log.debug(error.stack);
    }else{
        log.error(error);
    }
    return true //to let the next function (close()) know that an error occured
}//------------------------------------------------------------------------------------------

async function close(error){
    await log.flushLogs();
    if(error){
        process.exit(1);
    }else{
        process.exit(0);
    }
}//------------------------------------------------------------------------------------------

async function generatePrinterArray(){// extract alma printers from config to query
    var result = [];
    for(element of await config.getAlmaPrinters()){
        if(!result.includes(element.almaPrinter)){result.push(element.almaPrinter)}
    }
    log.debug("Printer Array for query")
    log.debug(JSON.stringify(result));
    return result;
}//------------------------------------------------------------------------------------------

async function getPrintOuts(printerArray){// request printouts from API, use multiple requests if necessary
    var result = [];
    var tmp = await almaPrint.getPrintOuts(printerArray,resultLimit);
    if(("printout" in tmp)&&("total_record_count" in tmp)){
        log.info(`total record count in response: ${tmp.total_record_count}`)
        result.push(...tmp.printout);
        if(resultLimit < tmp.total_record_count){
            log.info("offset request required");
            for(var offset = resultLimit;offset < tmp.total_record_count;offset += resultLimit){
                var tmp2 = await almaPrint.getPrintOuts(printerArray,resultLimit,offset);
                if("printout" in tmp2){
                    result.push(...tmp2.printout)
                }else{throw new Error("API returned unexpected format/data while requesting with offset")}
            }
        }
        return result;
    }else{
        if("total_record_count" in tmp){
            if (tmp.total_record_count == 0){
                log.info("API returned 0 results")
                return result;
            }
        }else{throw new Error("API returned unexpected format/data")}
    }
}//------------------------------------------------------------------------------------------

function extractIDs(letterArray){// extract the ID numbers for all letters returned from API
    let result = [];
    for (entry of letterArray){result.push(entry.id)}
    return result
}//------------------------------------------------------------------------------------------

async function compare(newSet){
    log.debug(`New Set:${newSet}`);
    let oldData;
    oldData = await fs.readFile(dataFile).catch(()=>oldData = "[]");
    let oldSet;
    try{oldSet = JSON.parse(oldData);}catch{oldSet = []}
    log.debug(`Old Set:${oldSet}`);

    if(oldSet.some(element=>newSet.includes(element))){// if some elements of oldSet are included in newSet => some letters are stuck
        log.error("Some letters are stuck in queue, check Print Server");

        if(await config.getMailEnabled() && (transporter !== undefined)){
            var tmp = {//compose Mail
                from: await config.getMailSender(), // sender address
                to: await config.getMailRecipient(), // list of receivers
                subject: await config.getMailSubject(), // Subject line
                text: await config.getMailText(), // plain text body
              }
            await transporter.sendMail(tmp);
        }
    }
    await fs.writeFile(dataFile,JSON.stringify(newSet))
}//------------------------------------------------------------------------------------------

//Main:
Promise.resolve()
.then(log.init)
.then(config.init)
.then(initMailer)
.then(generatePrinterArray)
.then(getPrintOuts)
.then(extractIDs)
.then(compare)
.catch(reportAndClose)
.then(close)