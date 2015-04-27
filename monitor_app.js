var sio = require('socket.io')
  , http = require('http')
  , request = require('request')
  , os = require('os')
  ,responseTime = require('response-time')
  ,_responseTime = responseTime()
  ;
var counter = 0;
var instanceId = 'i-8b032fa4';
var aws = require('aws-sdk');
// configure AWS security tokens
aws.config.update({accessKeyId:'AKIAJSNBZWZQ2AGNLS3Q', 
secretAccessKey:'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',
region: 'us-east-1'});
var ec2 = new aws.EC2();

var app = http.createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end();
    })
  , io = sio.listen(app);

var loadpercent;
function memoryLoad()
{
	var totalmemory = os.totalmem();
	var freememory = os.freemem();
	console.log( totalmemory, freememory );
	var memUsed = totalmemory - freememory;
	loadpercent = memUsed/totalmemory * 100 ;

	return (~~(loadpercent));
}
var terminated = false;
function statusVal() 
{
	if(loadpercent < 60 && cpuload < 60)
	{
		counter--;
		return "OK";
	}
	else
	{
		counter++;
		if(counter>2)
		{
			//stopInstance(instanceId);
			return "Terminated"
		}
		return "ALERT";
	}
}
// Create function to get CPU information
function cpuTicksAcrossCores() 
{
  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();
 
  //Loop through CPU cores
  for(var i = 0, len = cpus.length; i < len; i++) 
  {
		//Select CPU core
		var cpu = cpus[i];
		//Total up the time in the cores tick
		for(type in cpu.times) 
		{
			totalTick += cpu.times[type];
		}     
		//Total up the idle time of the core
		totalIdle += cpu.times.idle;
  }
 
  //Return the average Idle and Tick times
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

var startMeasure = cpuTicksAcrossCores();
var cpuload = 0;
function cpuAverage()
{
	var endMeasure = cpuTicksAcrossCores(); 
 
	//Calculate the difference in idle and total time between the measures
	var idleDifference = endMeasure.idle - startMeasure.idle;
	var totalDifference = endMeasure.total - startMeasure.total;
 
 	cpuload = (totalDifference - idleDifference)/totalDifference
	//Calculate the average percentage CPU usage
	cpuload = cpuload*100;
	return (~~(cpuload));
}


function stopInstance(instanceId) {
    ec2.stopInstances({ InstanceIds: [instanceId] }, function(err, data) {
        if(err) {
            console.error(err.toString());
        } else {
                 console.log('STOPPED:\t' + instanceId);
                 terminated = true;
            } 
        
    });
}



var nodeServers = [];

///////////////
//// Broadcast heartbeat over websockets
//////////////
var i = 0;
var interval = setInterval( function () 
{
	if(terminated == true)
	{
		clearInterval(interval);
		process.exit(0);
	}
	io.sockets.emit('heartbeat', 
	{ 
        name: "Doctor Node", cpu: cpuAverage(), memoryLoad: memoryLoad(), statusCode: statusVal(), counter: counter
   });
}, 2000);

app.listen(3000);
