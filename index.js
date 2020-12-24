const express = require("express");
const app = express();
const path = require('path');
var http = require('http');
const fs = require('fs')
const port = process.env.PORT || 3000
const request = require('request');
const axios = require('axios');
const FormData = require('form-data');
const xml2js = require('xml2js');
var parser = new xml2js.Parser();
let xml = '';
const soapURL = 'https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx'

app.get("*", (req, res) => {
    const ind = path.join(__dirname, 'public', 'index.html');
    res.sendFile(ind);
});
app.use(express.urlencoded({
    extended: true
}))
var bodyParser = require('body-parser');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname);

const getToken = async(clientid, clientSecret, url) => {
    var formData = new FormData();
    formData.append('client_id', clientid)
    formData.append('client_secret', clientSecret)
    formData.append('grant_type', 'client_credentials')
    const tokenResponse = await axios({
        method: 'post',
        url: `${url}v2/token`,
        data: formData,
        headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        },
    })
    return tokenResponse.data.access_token
}

app.post('/PostData', (req, res) => {
    try {
        const { clientId, clientSecret, url } = req.body;
        console.log(clientId);
        console.log(clientSecret);
        console.log(url);
                    var arr = [];

        (async function() {

            const token = await getToken(clientId, clientSecret, url);
            console.log(token);

            const soapData = `<?xml version="1.0" encoding="UTF-8"?>
      <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
         <s:Header>
            <a:Action s:mustUnderstand="1">Retrieve</a:Action>
            <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID> 
            <a:ReplyTo>
               <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>
            </a:ReplyTo>
            <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>
            <fueloauth xmlns="http://exacttarget.com">${token}</fueloauth>
         </s:Header>
         <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
            <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">
               <RetrieveRequest>
                      <ObjectType>DataFolder</ObjectType>
                      <Properties>ID</Properties>
                      <Properties>Name</Properties>
                      <Properties>ContentType</Properties>
                      <Properties>ParentFolder.Name</Properties>
                      <Properties>ObjectID</Properties>
                      <Properties>ParentFolder.ObjectID</Properties>
                      <ns1:Filter
                           xmlns:ns1="http://exacttarget.com/wsdl/partnerAPI" xsi:type="ns1:SimpleFilterPart">
                           <ns1:Property>ContentType</ns1:Property>
                           <ns1:SimpleOperator>equals</ns1:SimpleOperator>
                           <ns1:Value>dataextension</ns1:Value>
                      </ns1:Filter>
                      <QueryAllAccounts>true</QueryAllAccounts>
                  </RetrieveRequest>
            </RetrieveRequestMsg>
         </s:Body>
      </s:Envelope>`
            const soapResponse = await axios({
                method: 'post',
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Bearer ${token}`
                },
                url: soapURL,
                data: soapData,
                timeout: 10000
            })
            if (soapResponse) {
                parser.parseString(soapResponse.data, function(err, result) {
           console.log('log results : ',JSON.stringify(result));
                    console.log(JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]["Results"]));
                    var resultDE=result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]["Results"];
            for (var i = 0; i < resultDE.length; i++) {
                arr.push(resultDE[i]["Name"]);
            }
                    console.log(arr);
                        const ind2 = path.join(__dirname, 'public', 'SFMC-DE.html');
                    res.render('SFDC.ejs', {data:arr} );
      //  const ind2 = path.join(__dirname, 'public', 'SFMC-DE.html');

       // res.sendFile(ind2);
//res.json({ username:arr})
                 }
        })();
    } catch (err) {
        console.log(err);
    }

});

app.listen(port, () => {
    console.log('Example app is listening on port http://localhost:${port}');
});
