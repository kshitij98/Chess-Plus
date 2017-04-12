window.onload = function() {  
  $('.field').on('focus', function() {
    $('.searchBox').addClass('is-focus');
  $('.drawer, a').addClass('active');  
  });
  
  $('.field').on('blur', function() {
    $('.searchBox').removeClass('is-focus is-type');
  $('.drawer, a').removeClass('active');  
  });
  
  $('.field').on('keydown', function(event) {
    $('.searchBox').addClass('is-type');
    if((event.which === 8) && $(this).val() === '') {
      $('.searchBox').removeClass('is-type');
    }
  });
};