const express = require("express");
const app = express();
const path = require('path');
var http = require('http');
const fs = require('fs')
const port = process.env.PORT || 3000
const request = require('request');
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

app.post('/PostData', (req, res) => {
			const clientSec = req.body.clientSecret
			request.post({
				headers: {
					'content-type': 'application/json'
				},
				url: 'https://mc6vgk-sxj9p08pqwxqz9hw9-4my.auth.marketingcloudapis.com/v2/token',
				body: {
					'client_id': '3pj0hhotbu0t2c62lrzib020', //pass Client ID
					'client_secret': '82Z6UD4Zos80P1G6csqsrdaq', //pass Client Secret
					'grant_type': 'client_credentials',
					'account_id': '514010252'
				},
				json: true
			}, function(error, response, body) {
				var data=`<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"><s:Header><a:Actions:mustUnderstand="1">Retrieve</a:Action><a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID><a:ReplyTo>       <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address></a:ReplyTo><a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>      <fueloauth xmlns="http://exacttarget.com">'+body.access_token+'</fueloauth></s:Header><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">     <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI"> <RetrieveRequest><ObjectType>DataExtension</ObjectType> <Properties>CustomerKey</Properties><Properties>Name</Properties><Properties>DataExtension.ObjectID</Properties> <Properties>IsSendable</Properties>  <Properties>CategoryID</Properties>  	<Filter xsi:type="SimpleFilterPart"> <Property>CategoryID</Property><SimpleOperator>equals</SimpleOperator><Value>29130</Value></Filter>    </RetrieveRequest> </RetrieveRequestMsg> </s:Body></s:Envelope>`;
				request.post({
				headers: {
					'content-type': 'text/xml',
					'Authorization':'Bearer '+body.access_token,
					SOAPAction: 'runTransaction'
				},
				url: 'https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx',
				body:data,
				json:true
				},function(error2,response2,body2){
					
					console.log('\nSOAP Body'+(body));
					console.log('\nSOAP Error'+(error2));
					console.log('\nSOAP Response'+(response2));
					console.log('\nSOAP Body'+JSON.stringify(body));
					console.log('\nSOAP Error'+JSON.stringify(error2));
					console.log('\nSOAP Response'+JSON.stringify(response2));
					
				})			
				const ind2 = path.join(__dirname, 'public', 'SFMC-DE.html');
				res.sendFile(ind2);
				console.log("Access" + body.access_token);
				console.log("response" + response);
				console.log(clientSec);
				//  res.send(clientSec);   
			})
	
});
app.listen(port, () => {
      console.log('Example app is listening on port http://localhost:${port}');
});
