$(function() {
  console.log("ADSG");
  'use strict';
  var snackbarContainer = $('#demo-toast-example');
  var showSnackbarButton = $('#demo-show-toast');
  var handler = function(event) {
    showSnackbarButton.style.backgroundColor = '';
  };
  console.log(showSnackbarButton);
  showSnackbarButton.click(function() {
    'use strict';
    showSnackbarButton.css({'background-color': '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16)});
    var data = {
      message: 'Someone has challenged you.',
      timeout: 10000,
      actionHandler: handler,
      actionText: 'Accept',
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  });
});