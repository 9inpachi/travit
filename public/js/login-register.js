$(document).ready(function () {
  $('#register-box>form').submit(function (e) {
    e.preventDefault();
    if ($('input[name=r_password]').val() != $('input[name=r_cpassword]').val()) {
      $('#register-box>form .err').html('Passwords don\'t match');
      return false;
    } else {
      $('#register-box>form .err').html('');
      //AJAX register check
      var userRegData = {
        'r_fullname': $('input[name="r_fullname"]').val(),
        'r_email': $('input[name="r_email"]').val(),
        'r_username': $('input[name="r_username"]').val(),
        'r_dob': $('input[name="r_dob"]').val(),
        'r_password': $('input[name="r_password"]').val(),
        'r_cpassword': $('input[name="r_cpassword"]').val()
      }
      $.ajax({
        type: 'POST',
        url: '/register',
        data: userRegData,
        dataType: 'json',
        success: function (resData) {
          console.log(resData.status);
          if (resData.status) {
            $('#register-box>form .err').css('color', 'green');
            $('#register-box>form').trigger('reset');
          } else {
            $('#register-box>form .err').css('color', 'red');
          }
          $('#register-box>form .err').html(resData.res);
        }
      });
    }
  });
  $('#login-form').submit(function (e) {
    e.preventDefault();
    $('#login-form .err').html('');
    //AJAX login
    var userLoginData = {
      'l_username': $('input[name="l_username"]').val(),
      'l_password': $('input[name="l_password"]').val()
    }
    $.ajax({
      type: 'POST',
      url: '/login',
      data: userLoginData,
      dataType: 'json',
      success: function (resData) {
        if (resData.redirect)
          window.location.replace(resData.redirect);
        else
          $('#login-form .err').html(resData.error);
      },
      error: function (jqXHR, testStatus, resData) {
        $('#login-form .err').html(jqXHR.responseJSON.error);
      }
    });
  });
})
