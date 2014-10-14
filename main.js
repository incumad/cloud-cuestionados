// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
 
 
 
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
 
  
/**
 * Devuelve la fecha final inicial del usuario en el formato establecido, 
 * tiempo actual del servidor + diasVidaIniciales
 *   
 * @return {string} fecha en formato ISO
 */
Parse.Cloud.define("getFirstTimeToDie", function(request, response) {
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
  
    var sTime = year+"/"+sMonth+"/"+sDay+" "+sHour+':'+sMinute+':'+sSecond;
  
    response.success(sTime);
});
  
/**
 * Devuelve los milisengudos que le quedan de vida 
 * tiempo final del usuario - tiempo actual del servidor
 *   
 * @return {int} ms
 */
Parse.Cloud.define("getTimeToDie", function(request, response) {
    var query = new Parse.Query("Usuario");
    query.equalTo("objectId", request.params.usuarioId);
    query.find({
    success: function(results) {
        var finishDate = '';
        for (var i = 0; i < results.length; ++i) {
            finishDate = results[i].get("finish_time");
        }
  
        var fechaFinal = new Date(finishDate);
        var fechaServidor = new Date();
        var msToDye = fechaFinal.getTime() - fechaServidor.getTime();
        if (msToDye > 0) {
            response.success(msToDye);
        } else {
            response.success(0);
        }
    },
    error: function() {
      response.error("finishDate failed");
    }
  });
});
  
  
/**
 * Devuelve las preguntas activas de un usuario
 * 
 * @params usuarioId  
 * @return {array} preguntas
 */
Parse.Cloud.define("getCurrentQuestionsUser", function(request, response) {
    var goOutTime = new Date();
    var limitDayCehckAnswers = 7;
      
    // Cogemos las respuestas de los ultims "limitDayCehckAnswers" dias del 
    // usuario, para excluir las preguntas correspondientes
    goOutTime.setTime(goOutTime.getTime() - (limitDayCehckAnswers * 24 * 60 * 60 * 1000));
  
    var oRespuesta = Parse.Object.extend("Respuesta");
    var respuestasQuery = new Parse.Query(oRespuesta);
    respuestasQuery.greaterThan("createdAt", goOutTime);
    respuestasQuery.equalTo("userObjectId", request.params.usuarioId);
  
    respuestasQuery.find({
        success: function(results) {
            var now = new Date();
            var aRespuestas = [];
            for (var i = 0; i < results.length; ++i) {
                aRespuestas[i] = results[i].get("pregObjectId");
            }
  
            var preguntasQuery = new Parse.Query("Pregunta");
  
            preguntasQuery.lessThan("createdAt",now);
            preguntasQuery.greaterThanOrEqualTo("fechaFin",now);
            preguntasQuery.notContainedIn("objectId",aRespuestas);
  
            preguntasQuery.find({
               success: function(results){
                    response.success(results);
               },
               error: function() {
                    alert('Error al traer las preguntas');
               }        
            });
  
        },
        error: function() {
            alert('Error al comprobar las respuestas');
        }
  });
});
  
 
  
  
  
Parse.Cloud.job("lanzaPregunta", function(request, status) {
    Parse.Cloud.useMasterKey();
 
    var now = new Date();
  
     
    var oPreguntaNueva = Parse.Object.extend("PreguntaNueva");
    var preguntaNuevaQuery = new Parse.Query(oPreguntaNueva);
    var limitContra = 10;
  
    preguntaNuevaQuery.lessThan("moderarDesde",now);
    preguntaNuevaQuery.greaterThanOrEqualTo("moderarHasta",now);
    preguntaNuevaQuery.notEqualTo("indUso", '1');
    //preguntaNuevaQuery.equalTo("idioma", request.params.channel);    
    preguntaNuevaQuery.equalTo("idioma", 'esp');
    preguntaNuevaQuery.lessThan("votosContra",limitContra);
    preguntaNuevaQuery.descending("votosFavor");
 
    preguntaNuevaQuery.first({    
      success: function(object) {
           if (typeof object == "undefined") {
                // no hay preguntas con lo que paro
                 
                return;
            } else {
                                 
                     
                            object.set('indUso','1');
                                 
 
                 
                                  object.save();
                                   
                                   
                                    //success: function(object2) {
                                        //  alert('New object created with objectId1: ');
     
                                        //OBTENEMOS LOS DATOS
                                          var texto = object.get("texto");
                                          var acierto1 = object.get("acierto1");
                                          var acierto2 = object.get("acierto2");
                                          var acierto3 = object.get("acierto3");
                                          var acierto4 = object.get("acierto4");
                                          var creadorIdFB = object.get("creadorIdFB");
                                          var creadorNombre = object.get("creadorNombre");
                                          var horas = object.get("horas");
                                          var idioma = object.get("idioma");
                                          var respuesta1 = object.get("respuesta1");
                                          var respuesta2 = object.get("respuesta2");
                                          var respuesta3 = object.get("respuesta3");
                                          var respuesta4 = object.get("respuesta4");
                                           
                                          //LOS GUARDAMOS EN PREGUNTA
                                           
                                           
                                            var diasVidaIniciales = 1;
                                        var horasPreg = parseInt(diasVidaIniciales * (8*60*60*1000));//8h
                                        var timePreg = new Date();
                                             
                                             
                                       
                                         
                                        timePreg.setTime(timePreg.getTime() + (diasVidaIniciales * 8*60*60*1000));//8h
                                        //timePreg.setTime(timePreg.getTime() + horasPreg);///////////////////////////esto fallaba
                                     
                                          var Pregunta = Parse.Object.extend("Pregunta");
                                           
                                  var preg = new Pregunta();
                                         
                                          preg.set('texto',texto);
                                          preg.set('respuesta1',respuesta1);    
                                          preg.set('respuesta2',respuesta2);    
                                          preg.set('respuesta3',respuesta3);    
                                          preg.set('respuesta4',respuesta4);    
                                          preg.set('idioma',idioma);    
                                          preg.set('horas',horas);  
                                          preg.set('fechaFin',timePreg);    
                                          preg.set('acierto1',acierto1);    
                                          preg.set('acierto2',acierto2);    
                                          preg.set('acierto3',acierto3);    
                                          preg.set('acierto4',acierto4);    
                                          preg.set('creador',creadorNombre);                
                                               
                                             
                                          preg.save(null, {
                                              success: function(pregun) {
                                                // Execute any logic that should take place after the object is saved.
                                                
                                                     
                                                alert('New object created with objectId2: ');               
                                               
                                            Parse.Push.send({//push
                                              channels: ["esp"],
                                              expiration_interval: 480,
                                              data: {
                                                alert: "Prueba job: " +object.get('texto')
                                              }
                                            }, {
                                            success: function() {
                                                 status.success("Pregunta enviada.");
                                            },
                                            error: function(error) {
                                                status.error("Pregunta fallida.");
                                              }
                                            });//push
                                              },
                                              error: function(pregun, error) {
                                                // Execute any logic that should take place if the save fails.
                                                // error is a Parse.Error with an error code and message.
                                                alert('Failed to create new object, with error code: ' + error.message);
                                                status.error("Pregunta fallida.");
                                              }
                                            });
                    }//else
      },//succes 
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
        status.error("Pregunta fallida.");
      }//error
      });//preguntaNuevaQuery.first
  
});