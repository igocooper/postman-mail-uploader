const webdriverio = require('webdriverio');
const options = { desiredCapabilities: { browserName: 'firefox' } };
const config = require('./config');
const browser = webdriverio.remote(options);
const fs = require('fs');

const colors = {
    black : "\x1b[30m",
    red : "\x1b[31m",
    green : "\x1b[32m",
    yellow : "\x1b[33m",
    blue : "\x1b[34m",
    magenta : "\x1b[35m",
    cyan : "\x1b[36m",
    white : "\x1b[37m"
}

// add source to config
let source = fs.readFileSync(`./source.json`).toString(); 
source = JSON.parse(source);

if (!source.html || !source.subject || !source.css || !source.bodyPlain) {
    throw new Error('Source files missed required fields, make sure it has subject, css, html and bodyplain included');
}

config.source = source;

function setHTML(locales, browser){ 
    if (!locales.length) {
        return browser.end();
    }
   const locale = locales[0];
   
   browser
   .url(`http://postman.cloudmccloud.com/index/edit/${config.template}/${locale}`)
   .execute(function(config, locale){
       // set HTML value
       var html = document.querySelector('#html');
       html.value = config.source.html[locale];

       // set subject 
       var subject = document.querySelector('#subject');
       subject.value = config.source.subject[locale];

       // set body plain 
       var bodyplain = document.querySelector('#bodyplain');
       bodyplain.value = config.source.bodyPlain[locale];

       // set css 
       var css = document.querySelector('#css');
       css.value = config.source.css[locale];

   }, config, locale)
   .pause(2000)
   .click('input#submit').then(function(){
       console.log(colors.yellow, `${locale.toUpperCase()}. Changed HTML / Subject / CSS / Plain text and Saved`);
   })
   .pause(3000)
   .click('#tableVersions tbody tr:nth-child(1) td:nth-child(2) a').then(function(){
       console.log(colors.yellow, `${locale.toUpperCase()}. Release changed.`);
       console.log(colors.blue,`_____________________`);
       if(locales.length){
           locales.shift();
           setHTML(locales, browser);
       }
   })
  
};

browser
    .init()
    .url('http://postman.cloudmccloud.com/login')
    .setValue('#email',`${config.credentials.login}`)
    .setValue('#password',`${config.credentials.password}`)
    .click('.btn-success').then(function(){
        console.log(colors.green,'Login done.');
        setHTML(config.locales, browser);
    })
    // .waitForExist('#mainBlockMenu')
    .catch(function(err) {
        console.log(err);
    });


