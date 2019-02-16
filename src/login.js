console.log('Its finished!!')

if (module.hot)       // eslint-disable-line no-undef
  module.hot.accept() // eslint-disable-line no-undef
  var validateText = (username) => {
    return /^[0-9a-zA-Z_.-]+$/.test(username);
}
$(function () {
    $('#submitUserName').click(() => {
    var text =  $('#userName').val();
    if(validateText(text)){ 
         localStorage.setItem('userName',text) ;
         window.location.replace(window.location.href + 'game' );
        } else {
            alert('error')
        }
    });

});