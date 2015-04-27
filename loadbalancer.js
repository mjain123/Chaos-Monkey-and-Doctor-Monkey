var httpProxy = require('http-proxy');
var options = {};
var proxy   = httpProxy.createProxyServer(options);
var express = require('express')
var app = express();
var request = require('request');
var heartbeats = require('heartbeats');
var instances = ['http://52.6.177.247:3002','http://52.6.14.123:3002','http://52.4.57.171:3002','http://52.5.76.6:3002','http://52.6.207.73:3002','http://52.5.207.184:3000','http://52.6.16.93:3000', 'http://52.6.74.185:3000' ];
var backup = ['http://52.10.157.209:3001', 'http://54.148.157.33:3001', 'http://54.148.142.165:3001']
var TARGET = undefined;
var counter = 0;
var options;

app.get('/', function(req, res, next) {
	//console.log(req.method, req.url);

	TARGET = instances.shift();
	if(TARGET != undefined)
	{
		options = {url: TARGET };
		 console.log("Forwarding request to : "+TARGET);
		 request(options, function(req,response,error)
				{
					if(error!=null)
					{
								console.log("Success");
								instances.push(TARGET);						
					}
					else
					{
								console.log("Redirecting...");
								res.redirect('http://localhost:3000')
					}
				}).pipe(res);
	}
	else
	{
		res.send("Application server down.")
	}
	
});

app.listen(3000,'localhost');


var heart = heartbeats.createHeart(1000);
heart.createEvent(2, function(heartbeat, last){
	//console.log("beat");
	if(instances.length < 3)
	{
		console.log("\n");
		for(i = 0;i<backup.length;i++)
			{
				console.log(backup[i]);
				instances.push(backup[i]);
			}
		console.log("\nBack up servers added.")
		console.log("\n");
	}
});