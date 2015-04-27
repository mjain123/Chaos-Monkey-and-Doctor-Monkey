var StatusModel = function(clients) {
    var self = this;
    self.clients = ko.observableArray();

    self.addClient = function(client) {
        self.clients.push(
            new ClientModel(client)
        );
    };
 
    self.removeClient = function(client) {
        self.clients.remove(client);
    };
 
    self.updateClient = function(person) 
    {
        for(var i = 0 ; i < self.clients().length ; i++)
        {
            var koObj = self.clients()[i];
            //console.log( koObj.name() )
            if(self.clients()[i].name() === person.name)
            {
                koObj.cpu(person.cpu);
                koObj.memoryLoad(person.memoryLoad);
                koObj.statusCode(person.statusCode);
                koObj.counter(person.counter);
                break;
            }
        }
    };

    // initialize first time.
    for( var i = 0; i < clients.length; i++)
    {
        self.addClient( clients[i] );
    }
};

var ClientModel = function(client)
{
    var self = this;
    self.cpu = ko.observable(client.cpu);
    self.memoryLoad = ko.observable(client.memoryLoad);
    self.statusCode = ko.observable(client.statusCode);
    self.name = ko.observable(client.name);
    self.counter = ko.observable(client.counter);

}

var NodeModel = function(node) {
    var self = this;
    self.color = ko.observable(node.color);
};

 
var viewModel = new StatusModel(
[
    { 
        name: "Doctor Node", cpu: "39.95", memoryLoad: "40", statusCode: "Cool", counter: "0"
    },
    { 
        name: "172.31.15.184", cpu: "0.00", memoryLoad: "0", statusCode: "Cool", counter: "0"
    },
    { 
        name: "172.31.15.186", cpu: "0.00", memoryLoad: "0", statusCode: "Cool", counter: "0"
    },
    { 
        name: "172.31.11.160", cpu: "0.00", memoryLoad: "0", statusCode: "Cool", counter: "0"
    },
    { 
        name: "172.31.0.80", cpu: "0.00", memoryLoad: "0", statusCode: "Cool", counter: "0"
    },
    { 
        name: "172.31.0.52", cpu: "0.00", memoryLoad: "0", statusCode: "Cool", counter: "0"
    },
    { 
        name: "172.31.11.221", cpu: "0.00", memoryLoad: "0", statusCode: "Cool", counter: "0"
    },
    { 
        name: "172.31.6.211", cpu: "0.00", memoryLoad: "0", statusCode: "Cool", counter: "0"
    },
    { 
        name: "172.31.11.5", cpu: "0.00", memoryLoad: "0", statusCode: "Cool", counter: "0"
    }
]);

var instances = [{ip: 'http://localhost:3000'}, { ip:'http://52.5.27.239 :3000'}, { ip: 'http://52.5.191.82:3000'}, { ip: 'http://52.4.137.240:3000'}, { ip: 'http://52.6.161.115:3000'}, { ip: 'http://52.4.250.231:3000'}, { ip: 'http://52.6.74.164:3000'} , { ip: 'http://52.4.71.183:3000'} , { ip: 'http://52.6.146.139:3000'}  ];
var socket = [];
$(document).ready( function()
{
    ko.applyBindings(viewModel);
    $('#statusTable').DataTable( { "paging":   false, "info":     false });

    for(var i = 0; i<instances.length;i++)
   {
            socket[i] = io.connect(instances[i].ip);
            something(socket[i], i);
   }





}); 

function something(socket)
{
    socket.on("heartbeat", function(client) 
    {
        console.log(JSON.stringify(client));
        viewModel.updateClient( 
        {
            name:client.name, 
            cpu:client.cpu, 
            memoryLoad: client.memoryLoad,
            statusCode: client.statusCode,
            counter: client.counter
        });
        $('#statusTable td.status').each(function(){
        if ($(this).text() == 'ALERT') {
              $(this).css('background-color','Orange');
        }
        if ($(this).text() == 'Terminated') {
            $(this).css('background-color','Red');
        }
        if ($(this).text() == 'Cool') {
            $(this).css('background-color','Blue');
        }
        if ($(this).text() == 'OK') {
            $(this).css('background-color','LightBlue');
        }
    });
    });
}
