var OpenNebula = require('opennebula');
var one = new OpenNebula('oneadmin:opennebula', 'http://192.168.1.99:2633/RPC2');

function continue(){
  one.getTemplates(function(err, templates) {
     if(templates.length>0){
       var template = one.getTemplate(0);

        template.instantiate('new instance', undefined, undefined, function(err, vm) {
          one.getVMs(function(err, data) {
            if(data[0]==undefined){
              console.log('nenhuma máquina criada');
            }else{
              console.log('VM criada nº. VMs',data.length);
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
            }
          });

        });
     }else{
       console.log('sem templates criados');
     }
  });
}

one.getVMs(function(err, data) {
  console.log(data[0]==undefined?'nenhuma máquina criada':data.length + 'vms existentes');
  if(data.length>0){
    for(var i = 0; i < data.length; i++){
      var vm = one.getVM(data[i].ID);
      vm.action('delete', function(err, data) {
        one.getVMs(function(err,data){
            console.log('supostamente vms apagadas:',data.length);
            continue();
        });
      });
    }
  }else{
    continue();
  }
});

one.getHosts(function(err, data) {
  //console.log(data);
});
