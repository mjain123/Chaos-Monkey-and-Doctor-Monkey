# Chaos-Monkey-and-Doctor-Monkey

Resilience testing confirms that the system can recover from expected or unexpected events without loss of data or functionality. 

To perform Resilience testing, we have implemented Chaos Monkey.

#### Chaos Monkey
Chaos Monkey is a service which randomly terminates one or more instances in the group. Various companies execute chaos monkey in a controlled manner during work hours (generally 9am to 3pm monday to friday) which randomly disrupts different groups. This is done to detect and handle an error during work hours instead of client finding out a problem at other times.

To implement chaos monkey, we have made use of npm aws-sdk package. It provides methods to shut down, terminate, list instances, etc. 

Twice random numbers are generated. First - to select number of instances to stop. Second - to select the instance to stop.

```sh
var number = Math.floor(random(1, instances.length-1));                      // random number of instances to shut down
console.log("Shutting down "+number+ " instances - Chaos Monkey");

for( i =0;i<number;i++)
{
  var position = Math.floor(random(0, instances.length-1));               // random instance 
  stopInstance(instances[position]);
  console.log(instances[position]);
}
```

The method `ec2.stopInstances({ InstanceIds: [instanceId] }` is used to stop the instance.

![image1](/img/chaos2.JPG)

![image2](/img/chaosmonkey.jpg)

#### Chaos Monkey to test back up
Chaos monkey can also be used to check if the backup servers are working and they come up correctly when needed. To demonstrate this, we have added a list of backup servers. A heartbeat checks for number of application servers available and if this value crosses a certain threshold, it alerts the user and adds the backup servers to the lists.

![image3](/img/backup.png)

The load balancer forwards the request to the application server, but if the error is received, it redirects the request and forwards it to the next server in the list.

```sh
 request(options, function(req,response,error)
				{
					if(error!=null)
					{
								console.log("Success");
								instances.push(TARGET);						// Add the server back to last position in the list
					}
					else
					{
								console.log("Redirecting...");
								res.redirect('http://localhost:3000')         // Redirect back to proxy to be handles by next server.
					}
				}).pipe(res);
```

![image4](/img/redirect.png)


#### Doctor Monkey
Job of the Doctor Monkey is to perform health checks on instances. If any unhealthy instances are detected, they are reported and removed from service.

We have used the following approach - 

Each instance is running a small application which monitors its health and maintains a counter.

For every 'ALERT', this counter is increased and for every 'OK' status, this counter is decreased -> Thus a couple of ALERTS will not cause the machine to terminate. Only if there are various ALERTS in a short span of time, the device will be terminated.

```sh
function statusVal() 
{
	if(loadpercent < 50 && cpuload < 50)
	{
		counter--;
		if(counter<0)
			counter = 0;
		return "OK";
	}
	else
	{
		counter++;
		if(counter>5)
		{
			stopInstance(instanceId);
			return "Terminated"
		}
		return "ALERT";
	}
}

```

The Doctor node executes and have a heartbeat monitoring each of the instance every 2 seconds. It displays the result on the index.html file.

The output is color coded as followed -
1. Cool (BLUE) - not monitored/ connected.
2. Ok (Light Blue) - working fine.
3. Alert (Orange) - Threshold crossed.
4. Terminated (Red) - Instance terminated.

![image5](/img/doctor.jpg)
