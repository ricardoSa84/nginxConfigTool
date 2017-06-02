var UPSTREAM_PLACEHOLDER = "upstreamsContentPlaceholder",
  UPSTREAM_COMPONENT = "updstreamComponent",
  serverObjects = {
    key : 'val',
    key1: 'val1'
  }

$(document).ready(function() {

  $('.nav li a').click(function(e) {

    $('.nav li').removeClass('active');

    var $parent = $(this).parent();
    if (!$parent.hasClass('active')) {
      $parent.addClass('active');
    }
  });

  $('#addUpstreamsCircle').on('click', function() {
    getNewComponent({placeholder: UPSTREAM_PLACEHOLDER, component: UPSTREAM_COMPONENT, title: undefined});
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
function getNewComponent(data) {

  if (data != undefined && data != null) {
    var newDiv = $('<div class="col-lg-4 col-md-4 col-sm-4"/>'),
      row = $('<div class="row""/>'),
      titleBox,
      deleteButton,
      editButton,
      saveButton,
      buttonContainer = $('<div class="col-lg-2 col-md-2 col-sm-3" />'),
      label = $('<label class="col-lg-2 col-md-2 col-sm-12" for:"titleInput"/>').text('Title:');

    if (data.title != undefined && data.title != null) {

      titleBox = $('<div class="col-lg-6 col-md-6 col-sm-7"/>').attr({name: 'titleBox'});
      titleBox.text(data.title);

      editButton = $('<div class="editButton col-lg-6 col-md-6 col-sm-6"> <i class="material-icons">mode_edit</i> </div>');
      //TODO: colocar evento de edit em que remove filhos deste new div e coloca novos e o guardar depois reverte a este estado
      //TODO: e capaz de ser melhor guardar o objecto e alterar ao modificar do que criar novamente tudo, tem de se ver.
    } else {

      titleBox = $('<input class="col-lg-7 col-md-7 col-sm-7"/>').attr({id: 'titleInput', type: 'text'});
      titleBox.text(data.title);
      row.append(label,titleBox);
      row.appendTo(newDiv);

      saveButton = $('<div class="saveButton col-lg-6 col-md-6 col-sm-6"> <i class="material-icons">save</i> </div>');
      //TODO: colocar evento de save, guardar no objecto e alterar o layout
      saveButton.on('click',function(){
        //TODO: Aplicar regex pata ter certesa que escreve pelo menos um caracter e não só um espaço em branco.
        if($(this).parent().parent().parent().find('#titleInput').val() == ""){
          alert('Title cannot be empty');
        }else{
          getEditComponent($(this).parent().parent().parent());
        }
      });
    }

    deleteButton = $('<div class="deleteButton col-lg-6 col-md-6 col-sm-6"> <i class="material-icons">delete_forever</i> </div>').on('click', function(event) {
      //TODO:Remover o elemento do json antes de eliminar do ecrã
      $(this).parent().parent().parent().remove();
    });

    newDiv.appendTo('#' + data.placeholder);
    newDiv.append(label,titleBox,buttonContainer);
    row.appendTo(buttonContainer);
    row.append(saveButton,editButton,deleteButton);
  }
}

function getEditComponent(component) {

  var newComponent = $('<p>'+component.find('#titleInput').text()+'</p>'),
  row = $('<div class="row"/>'),
  btnRow = $('<div class="row"/>'),
  h2s12 = $('<h2 class="col-lg-12 col-md-12 col-sm-12" style="text-align:center">').text(component.find('#titleInput').val());
  col12 = $('<div class="col-lg-12 col-md-12 col-sm-12"/>'),
  col2 = $('<div class="col-lg-2 col-md-2 col-sm-2"/>'),
  col5 = $('<div class="col-lg-5 col-md-5 col-sm-10"/>'),
  combo1 = $('<select />'),
  inputID = 'inputField'+ component.find('inputField').length,
  input = $('<input class="col-lg-7 col-md-7 col-sm-7 inputField"/>').attr({id: inputID, type: 'text'}),
  buttonContainer = $('<div class="col-lg-2 col-md-2 col-sm-3" />'),
  saveButton = $('<div class="saveButton col-lg-6 col-md-6 col-sm-6"> <i class="material-icons">save</i> </div>').on('click',function(){
    //TODO: Guardar o objecto e escrever ficheiro...ou coisa parecida
  }),
  deleteButton = $('<div class="deleteButton col-lg-6 col-md-6 col-sm-6"> <i class="material-icons">delete_forever</i> </div>').on('click', function(event) {
    //TODO:Remover o elemento do json antes de eliminar do ecrã
    $(this).parent().parent().parent().remove();
  });

  $.each(serverObjects, function(val, text) {
        combo1.append(new Option(text,val));
    });
  component.empty();
  component.append(row);
  row.append(h2s12);
  component.append(row);
  row.append(col5);
  col5.append(combo1);
  row.append(col5);
  col5.append(input);
  row.append(buttonContainer);
  buttonContainer.append(btnRow);
  btnRow.appendTo(buttonContainer);
  btnRow.append(saveButton,deleteButton);


}
