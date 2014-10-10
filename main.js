Parse.Cloud.define("getServerTime", function(request, response) {
 
    var now = new Date();
    var monthnumber = now.getMonth();
    var monthday    = now.getDate();
    var year        = now.getFullYear();
    var HH=now .getHours();//yields hours 
    var mm=now .getMinutes();//yields minutes
    var ss=now .getSeconds();//yields seconds
 
 
 
    monthnumber ++;
    var sMonth=monthnumber.toString();
    var sDay=monthday.toString();
    var sHour=HH.toString();
    var sMinute=mm.toString();
    var sSecond=ss.toString();
    if (monthnumber<10) sMonth ="0" + sMonth;
    if (sDay<10) sDay ="0" +sDay;
    if (HH<10) sHour="0" +sHour;
    if (mm<10) sMinute="0" +sMinute;
    if (ss<10) sSecond="0" +sSecond;
 
 
    var Time=sDay+"/"+sMonth+"/"+year+" "+sHour+':'+sMinute+':'+sSecond; 
 
  response.success(Time);
});
 
 
Parse.Cloud.job("lanzaPregunta", function(request, status) {
  // Set up to modify user data
  Parse.Cloud.useMasterKey();
 
    var PregNueva = Parse.Object.extend("PreguntaNueva");
    var query = new Parse.Query(PregNueva);
    query.descending("votosFavor");
    query.first({
      success: function(object) {
          alert(object.get('texto'));    
            Parse.Push.send({
              channels: [ "esp"],
              expiration_interval: 480,
              data: {
                alert: "Prueba job: " +object.get('texto')
              }
            }, {
            success: function() {
                // Push was successful
            },
            error: function(error) {
                // Handle error
              }
            });

      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
 
});

/**
 * Devuelve la fecha final inicial del usuario en el formato establecido, 
 * tiempo actual del servidor + diasVidaIniciales
 *   
 * @return {string} fecha en formato ISO
 */
Parse.Cloud.define("getFirstTimeToDye", function(request, response) {
        var diasVidaIniciales = 5;
	var msDiasVidaIniciales = parseInt(diasVidaIniciales * (24*60*60*1000));
        var fecha = new Date();
        
        
        fecha.setTime(fecha.getTime() + msDiasVidaIniciales);
        
        var monthnumber = fecha.getMonth();
        var monthday    = fecha.getDate();
        var year        = fecha.getFullYear();
        var HH          = fecha .getHours();//yields hours 
        var mm          = fecha .getMinutes();//yields minutes
        var ss          = fecha .getSeconds();//yields seconds

        monthnumber ++;
        var sMonth      = monthnumber.toString();
        var sDay        = monthday.toString();
        var sHour       = HH.toString();
        var sMinute     = mm.toString();
        var sSecond     = ss.toString();
        
        if (monthnumber<10) sMonth = "0" + sMonth;
        if (sDay<10) sDay = "0" +sDay;
        if (HH<10) sHour = "0" +sHour;
        if (mm<10) sMinute = "0" +sMinute;
        if (ss<10) sSecond = "0" +sSecond;

        var sTime = sDay+"/"+sMonth+"/"+year+" "+sHour+':'+sMinute+':'+sSecond; 
   
        response.success(sTime);
});
