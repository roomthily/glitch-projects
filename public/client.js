$(function() {
  
  
  /* 
    based on https://github.com/mouse-reeve/placevalue_ascii/blob/master/placevalue_ascii.py
    to generate the star pattern onload
  */
  var f = function(x, y) {return Math.sqrt(Math.pow(x, 3) * Math.pow(y, 3)) / 5}
  var f2 = function(x, y) { return Math.pow(x, 2) * Math.pow(y, 2); }

  function patterner(fxn, height, width, placevalue, offset_y) {
      var visual = [];
      for (var i = offset_y; i < offset_y + height; i++) {
          var row = '';
          for (var j = 0; j < width; j++) {
              var value = parseInt(fxn(i, j+offset_y)).toString(2);
              var binary = value[value.length-placevalue];
              if (binary!== undefined && binary == '1') {
                  row += '*';
              } else {
                  row += ' ';
              }  
          }
          visual.push(row);
      }
      return visual.join('\n');
  }
  
  var height = 150,
      width = 200,
      offset_y = 52;

  // 9 is pretty good
  var placevalue = Math.ceil(Math.random() * 15 + 4);
  
  var pattern = patterner(f, height, width, placevalue, offset_y);
  
  var el = document.createElement('pre');
  el.innerHTML = pattern;
  
  $('.space').append(el);
  /* end star pattern */

});
