// Author: Jean-Marie Thewes

//Modules:
const fs = require("fs").promises;

//Global vars:
var config;

//Functions:
async function init(){//read the filename from environment and load it
    if(process.env.configFileName === undefined){
        throw new Error("Cannot find configFileName env Variable");
    }else{
        config = await JSON.parse(await fs.readFile(process.env.configFileName))
    }
}//------------------------------------------------------------------------------------------

function getConfig(){//return the whole config
    if(config == undefined){init()}
    return config;
}//------------------------------------------------------------------------------------------

async function getLogConfig(){
    if(config == undefined){await init()}
    if("logConfig" in config){
        if(Array.isArray(config.logConfig)){
            return config.logConfig;
        }else{
            return [config.logConfig];
        }
    }else{
        throw new Error("Error no log configuration in file")
    }
}//------------------------------------------------------------------------------------------

async function getLogTimestampFormat(){
    if(config == undefined){await init()}
    if("logTimestampFormat" in config){
        return config.logTimestampFormat;
    }else{
        return "YYYY-MM-DDTHH:mm:ss";
    }
}//------------------------------------------------------------------------------------------

async function getMaxLogAgeInDays(){
    if(config == undefined){await init()}
    if("maxLogAgeInDays" in config){
        return config.maxLogAgeInDays;
    }else{
        return 30;
    }
}//------------------------------------------------------------------------------------------

async function getApiPath(){
    if(config == undefined){await init()}
    if("apiPath" in config){
        return config.apiPath;
    }else{throw new Error ("no API Path found in config")}
}//------------------------------------------------------------------------------------------

async function getApiKey(){
    if(config == undefined){await init()}
    if("apiKey" in config){
        return config.apiKey;
    }else{throw new Error ("no API Key found in config")}
}//------------------------------------------------------------------------------------------

async function getAlmaPrinters(){
    if(config == undefined){await init()}
    if("almaPrinterProfiles" in config){
        return config.almaPrinterProfiles;
    }else{throw new Error("No Printers defined in config")}
}//------------------------------------------------------------------------------------------

async function getProxy(){
    if(config == undefined){await init()}
    if("proxy" in config){
        if(config.proxy == ""){
            return undefined
        }else{
            return config.proxy;
        }
    }else{return undefined}
}//------------------------------------------------------------------------------------------

function getMailEnabled(){
    if("mailEnabled" in config){
        return config.mailEnabled
    }else{return false}
}//------------------------------------------------------------------------------------------

function getMailServer(){
    if("mailServer" in config){
        return config.mailServer
    }else{throw new Error("mailserver must be defined in config")}
}//------------------------------------------------------------------------------------------

function getMailPort(){
    if("mailPort" in config){
        return config.mailPort
    }else{throw new Error("mailport must be defined in config")}
}//------------------------------------------------------------------------------------------

function getMailSender(){
    if("mailSender" in config){
        return config.mailSender
    }else{throw new Error("mailsender must be defined in config")}
}//------------------------------------------------------------------------------------------

function getMailRecipient(){
    if("mailRecipient" in config){
        return config.mailRecipient
    }else{throw new Error("mailrecipient must be defined in config")}
}//------------------------------------------------------------------------------------------

function getMailSubject(){
    if("mailSubject" in config){
        return config.mailSubject
    }else{throw new Error("mailrecipient must be defined in config")}
}//------------------------------------------------------------------------------------------

function getMailText(){
    if("mailText" in config){
        return config.mailText
    }else{throw new Error("mailrecipient must be defined in config")}
}//------------------------------------------------------------------------------------------

module.exports={
    init:init,
    getMailServer:getMailServer,
    getMailPort:getMailPort,
    getMailSender:getMailSender,
    getMailRecipient:getMailRecipient,
    getMailEnabled:getMailEnabled,
    getMailSubject:getMailSubject,
    getMailText:getMailText,
    getConfig:getConfig,
    getLogConfig:getLogConfig,
    getLogTimestampFormat:getLogTimestampFormat,
    getMaxLogAgeInDays:getMaxLogAgeInDays,
    getApiPath:getApiPath,
    getApiKey:getApiKey,
    getAlmaPrinters:getAlmaPrinters,
    getProxy:getProxy
}

