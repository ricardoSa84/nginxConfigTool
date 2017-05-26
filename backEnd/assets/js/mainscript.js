var UPSTREAM_PLACEHOLDER = "upstreamsContentPlaceholder",
    UPSTREAM_COMPONENT = "updstreamComponent";

$(document).ready(function () {

  $('.nav li a').click(function(e) {

        $('.nav li').removeClass('active');

        var $parent = $(this).parent();
        if (!$parent.hasClass('active')) {
            $parent.addClass('active');
        }
        e.preventDefault();
    });

    $('#addUpstreamsCircle').on('click',function(){
      getNewComponent({
        placeholder:UPSTREAM_PLACEHOLDER,
        component:UPSTREAM_COMPONENT,
        title:undefined
      });
    });

});

/*
Objecto a passar:
data{
  placeholder:'nome da classe do componente onde colocar os elementos ex: upstreamsContentPlaceholder',
  component:'nome da classe do component a criar ex:updstreamComponent',
  title:'titulo do component/objecto o que vem depois do upstreams e antes do { no ficheiro de conf do nginx'
}
title vir preenchido ou undefined vai determinar se é para retornar um elemento novo ou editavel
 */
function getNewComponent(data){

  if(data!=undefined && data!=null){
    var newDiv = $('<div/>').attr({class:data.component}),
    row = $('<div class="row"/>'),
    titleBox,
    deleteButton,
    saveButton,
    label = $('<div class="col-lg-6 col-md-6 col-sm-6 label"/div>').attr({text: 'Title'}).appendTo(row);

    if(data.title != undefined && data.title!= null){
      titleBox = $('<div class="col-lg-6 col-md-6 col-sm-6"/>').attr({name: 'titleBox'});
      titleBox.text(data.title);
      titleBox.appendTo(row).appendTo(newDiv);
      row.empty();

      saveButton =  $('<div class="editButton"> <i class="material-icons">mode_edit</i> </div>');
      //TODO: colocar evento de edit em que remove filhos deste new div e coloca novos e o guardar depois reverte a este estado
      //TODO: e capaz de ser melhor guardar o objecto e alterar ao modificar do que criar novamente tudo, tem de se ver.
      saveButton.appendTo(row).appendTo(newDiv);
      row.empty();
    }else{
      titleBox = $('<input class="col-lg-6 col-md-6 col-sm-6"/>').attr({type: 'text', name: 'titleBox'});
      titleBox.text(data.title);
      titleBox.appendTo(row).appendTo(newDiv);
      row.empty();

      var editButton =  $('<div class="editButton"> <i class="material-icons">save</i> </div>');
      //TODO: colocar evento de save, guardar no objecto e alterar o layout
      editButton.appendTo(row).appendTo(newDiv);
      row.empty();
    }

    deleteButton =  $('<div class="deleteButton"> <i class="material-icons">delete_forever</i> </div>').on('click',function(event){
      //TODO:Remover o elemento do json antes de eliminar do ecrã
      $(this).parent().remove();
    });
    deleteButton.appendTo(row).appendTo(newDiv);

    newDiv.appendTo('#'+data.placeholder);
  }
}

function removeComponent(component){

}
