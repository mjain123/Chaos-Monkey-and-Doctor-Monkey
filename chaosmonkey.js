var aws = require('aws-sdk');


 aws.config.update({accessKeyId:'XXX', 
secretAccessKey:'YYY',
region: 'us-east-1'});
var ec2 = new aws.EC2();
 

function stopInstance(instanceId) {
    ec2.stopInstances({ InstanceIds: [instanceId] }, function(err, data) {
        if(err) {
            console.error(err.toString());
        } else {
                 console.log('STOPPED:\t' + instanceId);
            } 
        
    });
}
function random (low, high) {
    return Math.random() * (high - low) + low;
}


var instances = ['i-9d032fb2', 'i-8b032fa4', 'i-8b0e3ca4','i-f20f3ddd','i-4f0f3d60','i-f00f3ddf','i-cd0f3de2','i-7d0f3d52'];                  // instances list
var number = Math.floor(random(1, instances.length-1));                      // random number of instances to shut down
console.log("Shutting down "+number+ " instances - Chaos Monkey");

for( i =0;i<number;i++)
{
  var position = Math.floor(random(0, instances.length-1));               // random instance 
  stopInstance(instances[position]);
  console.log(instances[position]);
}

