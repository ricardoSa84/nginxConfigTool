var OpenNebula = require('opennebula');
var one = new OpenNebula('oneadmin:opennebula', 'http://172.16.132.126:2633/RPC2');

one.getVMs(function(err, data) {
  //console.log(data[0]==undefined?'nenhuma máquina criada':data.length + 'vms existentes');
  //console.log('DATA:',data);
  if(data[0]!=undefined){
    for(var i = 0; i < data.length; i++){
      var vm = one.getVM(0+data[i].ID);
      //console.log(data);
      vm.action('delete', function(err, data) {
        one.getVMs(function(err,data){
            console.log('supostamente vms apagadas:',data.length);
        });
      });
    }
  }
});

one.getHosts(function(err, data) {
  //console.log(data);
});

one.getTemplates(function(err, templates) {
   if(templates.length>0){
     var template = one.getTemplate(0);

      template.instantiate('new instance', undefined, undefined, function(err, vm) {
        one.createVM(template, true, function(){
          one.getVMs(function(err, data) {
            if(data[0]==undefined){
              console.log('nenhuma máquina criada');
            }else{
              console.log('VM criada nº. VMs',data.length);
            /*
              vm.action('delete', function(err, data) {
                console.log('deleted:', data);
                one.getVMs(function(err, data) {
                  if(data[0]==undefined){
                    console.log('vm eliminada com sucesso');
                  }else{
                    console.log('não eliminou a vm',data[0]);
                  }
                });
              });

            */

            one.getHosts(function(err, data) {
              // console.log('hosts:',data[0].VMS);
               var host = one.getHost(parseInt(data[0].VMS.ID[0]));
               host.info(function(data){
                 console.log('info',data);
               });

            

             });
            }
          });
        });
      });
   }else{
     console.log('sem templates criados');
   }
});
