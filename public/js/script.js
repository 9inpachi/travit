$(document).ready(function () {
  //Login Register
  $('.tabs li').click(function () {
    $('.tabs li').removeClass('active');
    $(this).addClass('active');
    var dataBox = $(this).attr('data-tab');
    $('.tabs-data .tab-data').removeClass('active');
    $(dataBox).addClass('active');
  })
  //Index
  $('.search-wrap').click(function () {
    $('.top-search').focus();
  })
  $('.top-search').focus(function () {
    $('#search-icon').addClass('icon-active');
    setTimeout(function () {
      $('.top-search').attr('placeholder', 'Search for people, posts and more...');
    }, 200);
  })
  $('.top-search').focusout(function () {
    if (!$('.top-search').val()) {
      $('#search-icon').removeClass('icon-active');
      setTimeout(function () {
        $('.top-search').attr('placeholder', '');
      }, 200);
    }
  })
  //Create Post
  $('.create-post-btn').click(function () {
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
    } else {
      $(this).addClass('active');
    }
    if ($('.create-post').hasClass('active')) {
      $('.create-post').removeClass('active');
    } else {
      $('.create-post').addClass('active');
    }
  });
  $('.create-post').click(function () {
    $(this).addClass('active');
  });
  //post.js
  var oldMarker;
  var map = L.map('cr-post-mapid');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ''
  }).addTo(map);

  //Current Location
  locateUser();
  var locMarker = L.circleMarker();
  var locMarkerIns = L.circleMarker();
  map.on('locationfound', function (e) {
    addMarker(e);
    map.setZoom(16);
    locMarker.remove();
    locMarkerIns.remove();
    locMarker = L.circleMarker(e.latlng, {
      color: '#146ea7',
      fillColor: '#146ea7',
      fillOpacity: 0.3,
      radius: 20
    });
    locMarkerIns = L.circleMarker(e.latlng, {
      color: '#146ea7',
      fillColor: '#146ea7',
      fillOpacity: 0.8,
      radius: 5
    });
    locMarker.addTo(map);
    locMarkerIns.addTo(map);
  });
  map.on('click', function (e) {
    addMarker(e);
  });

  //Search location
  searchLoc = new L.Control.Search({
    url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
    jsonpParam: 'json_callback',
    propertyName: 'display_name',
    propertyLoc: ['lat', 'lon'],
    marker: false,
    autoCollapse: true,
    autoType: false,
    minLength: 2
  });
  map.addControl(searchLoc);
  searchLoc.on('search:locationfound', function (e) {
    addMarker(e);
  });

  //Use current location
  $('#crnt-loc-btn').click(function (e) {
    e.preventDefault();
    $(this).css('color', 'red');
    locateUser();
    map.on('locationfound', function (e) {
      addMarker(e);
      $('#crnt-loc-btn').css('color', '');
    });
  });

  //functions
  function locateUser() {
    map.locate({ setView: true, maxZoom: 16, watch: false });
  }
  //Adding marker
  function addMarker(e) {
    if (!oldMarker) {
      oldMarker = L.marker(e.latlng).bindPopup('Selected Location').addTo(map);
    } else {
      oldMarker.remove();
      oldMarker = L.marker(e.latlng).bindPopup('Selected Location').addTo(map);
    }
  }
  //functions end

  //Image upload
  //Image drag drop upload
  $(document).on({
    dragenter: function () {
      $('#add-img-drop').addClass('active');
    },
    dragover: function (e) {
      $('#add-img-drop').addClass('active');
      e.preventDefault();
    },
    dragleave: function () {
      $('#add-img-drop').removeClass('active');
    }
  });
  var imagesToUpload = new Array();
  var noOfImages = 0;
  $('.add-img-section').on('drop', function (e) {
    e.preventDefault();
    if (e.originalEvent.dataTransfer.items) {
      for (var i = 0; i < e.originalEvent.dataTransfer.items.length; i++) {
        if (e.originalEvent.dataTransfer.items[i].type.includes('image')) {
          var droppedFile = e.originalEvent.dataTransfer.items[i].getAsFile();
          imagesToUpload[noOfImages] = droppedFile;
          noOfImages++;
          var reader = new FileReader();
          reader.readAsDataURL(droppedFile);
          reader.onload = function (e1) {
            $('.add-img-images').html($('.add-img-images').html() + '<div class="add-img-queue"><img src=' + e1.target.result + ' /></div>')
          }
        }
      }
    }
    $('#add-img-drop').removeClass('active');
  });

  $('#add-image-input').change(function (e) {
    var inputFiles = e.target.files;
    if (inputFiles && inputFiles[0]) {
      for (var i = 0; i < inputFiles.length; i++) {
        if (inputFiles[i].type.includes('image')) {
          imagesToUpload[noOfImages] = inputFiles[i];
          noOfImages++;
          var reader = new FileReader();
          reader.readAsDataURL(inputFiles[i]);
          reader.onload = function (e1) {
            $('.add-img-images').html($('.add-img-images').html() + '<div class="add-img-queue"><img src=' + e1.target.result + ' /></div>')
          }
        }
      }
    }
  });

  $('#create-post-form').submit(function (e) {
    e.preventDefault();
    if (!$(this).html().includes('<div class="loader"></div>'))
      $(this).append('<div class="loader"></div>');
    var formData = new FormData();
    $.each(imagesToUpload, function (index, value) {
      formData.append("cr_post_img", value);
    });
    var selectedLoc = oldMarker.getLatLng().toString();
    selectedLoc = selectedLoc.substring(7, selectedLoc.length - 1).split(', ');
    formData.append('selectedLoc', selectedLoc);
    formData.append('cr_post_txt', $('textarea[name="cr_post_txt"]').val());
    $.ajax({
      type: 'POST',
      url: '/createpost',
      data: formData,
      processData: false, //ajax cant process formdata
      contentType: false,
      complete: function () {
        $('#create-post-form .loader').remove();
      },
      success: function (data) {
        //Removing post data
        imagesToUpload = [];
        $('#create-post-form').trigger('reset');
        $('#create-post-form .add-img-images .add-img-queue').remove();
        $('#create-post-form .err').css('color', '#49c353');
        $('#create-post-form .err').html('Post successfully created');
        console.log('Post successfully saved ' + data.res);
      },
      error: function (error) {
        $('#create-post-form .err').css('color', '');
        $('#create-post-form .err').html('Error creating post');
      }
    });
  })

});
