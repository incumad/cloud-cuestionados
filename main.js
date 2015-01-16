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
    query.first({
    success: function(object) {
        var finishDate = object.get("finish_time");
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
 * Devuelve los datos de inicio del juego
 * los milisengudos que le quedan de vida (tiempo final del usuario - tiempo actual del servidor)
 * Los días que lleva jugando
 *   
 * @return {int} ms
 */
Parse.Cloud.define("getInitSettings", function(request, response) {
    var query = new Parse.Query("Usuario");
    query.equalTo("objectId", request.params.usuarioId);
    query.first({
    success: function(object) {
            var finishDate = object.get("finish_time");
            var bornDate = object.get("bornAt");
            var fechaFinal = new Date(finishDate);
            var fechaServidor = new Date();
            var msToDye = fechaFinal.getTime() - fechaServidor.getTime();
 
            if (!bornDate) {
                bornDate = object.createdAt;
            }
 
            var fechaNacimientoJuego = new Date(bornDate);
 
            var t1 = fechaServidor.getTime();
            var t2 = fechaNacimientoJuego.getTime();
 
            var daysOflive = (t1 - t2) / (1000 * 60 * 60 * 24);
 
            if (daysOflive < 2) {
                daysOflive = 2;
            }
 
            response.success({msToDie:msToDye,daysOfLive: Math.floor(daysOflive)});
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
            preguntasQuery.equalTo("idioma", request.params.channel);
         
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
           
    Parse.Cloud.run("lanzaPreguntaChannel",{channel:'esp'},{
            success: function(results){
                 response.success("job esp ejecutado con exito");
            },
            error: function() {
                 status.error("No se ejecuto correctamente el cloud job esp");
            } 
    });
           
    Parse.Cloud.run("lanzaPreguntaChannel",{channel:'eng'},{
            success: function(results){
                 response.success("job eng ejecutado con exito");
            },
            error: function() {
                 status.error("No se ejecuto correctamente el cloud job eng");
            } 
    });    
       
});
       
       
/**
 * Lanza las preguntas generadas a un determinado canal
 * 
 * @params usuarioId  
 * @return {array} preguntas
 */
Parse.Cloud.define("lanzaPreguntaChannel", function(request, status) {
    Parse.Cloud.useMasterKey();
        
    var now = new Date();
           
            
    var oPreguntaNueva = Parse.Object.extend("PreguntaNueva");
    var preguntaNuevaQuery = new Parse.Query(oPreguntaNueva);
    var limitContra = 10;
         
    preguntaNuevaQuery.lessThan("moderarDesde",now);
    preguntaNuevaQuery.greaterThanOrEqualTo("moderarHasta",now);
    preguntaNuevaQuery.notEqualTo("indUso", '1');
    //preguntaNuevaQuery.equalTo("idioma", request.params.channel);    
    preguntaNuevaQuery.equalTo("idioma", request.params.channel);
    preguntaNuevaQuery.lessThan("votosContra",limitContra);
    preguntaNuevaQuery.descending("votosFavor");
        
    preguntaNuevaQuery.first({    
      success: function(object) {
           if (typeof object == "undefined") {
                // no hay preguntas con lo que paro
                status.error("No hay preguntas que lanzar en." + request.params.channel + " a las " + now.toLocaleString());
            } else {
                object.set('indUso','1');
                object.save();
       
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
                var horasCaducidadPregunta = 8;
                var horasPreg = parseInt(horasCaducidadPregunta * 60*60*1000);
                var timePreg = new Date();
                       
                var Pregunta = Parse.Object.extend("Pregunta");
                timePreg.setTime(timePreg.getTime() + horasPreg);//8h
       
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
                               
                        var sTxt = [];
                        sTxt['esp'] = "Tienes una nueva pregunta!";
                        sTxt['eng'] = "You have a new question!";
                               
                        // Execute any logic that should take place after the object is saved.
                        Parse.Push.send({//push
                            channels: [request.params.channel],
                            expiration_interval: 480,
                        data: {
                            alert: sTxt[request.params.channel] + ' ' + object.get('texto').substring(0,15) + '...'
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
                          status.error('Failed to create new object, with error code: ' + error.message);
                    }
                  });
            }
      },//succes 
      error: function(error) {
        status.error("Error: " + error.code + " " + error.message);
      }//error
      });//preguntaNuevaQuery.first
});
      
      
      
      
/**
 * Lanza las preguntas generadas por nosotros a un determinado canal
 * 
 * @params usuarioId  
 * @return {array} preguntas
 */
Parse.Cloud.define("lanzaAvisoPush", function(request, status) {
         
   var sTxt = [];
   sTxt['esp'] = "Pregunta especial!";
     sTxt['eng'] = "Special question!";
                              
   Parse.Push.send({//push
    channels: [request.params.channel],
    expiration_interval: 480,
        data: {
            alert: sTxt[request.params.channel]
        }
    }, {
    success: function() {
        status.success("Pregunta enviada.");        
    },
    error: function(error) {
        status.error("Pregunta fallida.");      
        }
    });//push
        
});
     
     
/**
 * Salva la respuesta de un propietario sumandole el tiempo oportuno en el caso 
 * de que sea una respuesta correcta
 * 
 * @params {params:{'numRespuesta':1, 'pregObjectId':'tqBEx5iSol', 'userObjectId':'LB97TVWmsb','horas':10,'acierto':1}}  
 * @return {array} preguntas
 */
Parse.Cloud.define("saveAnswer", function(request, status) {
         
    Parse.Cloud.useMasterKey();
         
    //Salvamos la respuesta
    var Respuesta = Parse.Object.extend("Respuesta");
    var oRespuesta = new Respuesta();
     
    oRespuesta.set('numRespuesta',request.params.numRespuesta);
    oRespuesta.set('pregObjectId',request.params.pregObjectId);   
    oRespuesta.set('userObjectId',request.params.userObjectId);
    oRespuesta.set('ind_acierto',request.params.acierto);
         
    oRespuesta.save(null, {
                    success: function(resp) {
                        if (request.params.acierto === 1) {
                            // Añadimos el tiempo al usuario
                            var query = new Parse.Query("Usuario");
                            query.equalTo("objectId", request.params.userObjectId);
                            query.first({    
                                success: function(object) {
                                    var finishDate = object.get("finish_time");
                                    var fechaFinal = new Date(finishDate);
     
                                    fechaFinal.setTime(fechaFinal.getTime() + (request.params.horas * 60 * 60 * 1000));
     
                                    object.set('finish_time', fechaFinal);
                                    object.save(null, {
                                        success: function(rs) {
                                            status.success("Respuesta salvada.");
                                        },
                                        error: function(error) {
                                            status.error("Error salvando finish_time: " + error.code + " " + error.message);
                                        }
                                    }); 
     
                                },
                                error: function(error) {
                                    status.error("Error: " + error.code + " " + error.message);
                                }//error
                            });
                        } else {
                            status.success("Respuesta erronea salvada.");
                        }
     
                        },
                    error: function(error) {
                        status.error("Error: " + error.code + " " + error.message);
                    }
                  });
        
});
    
    
    
/**
 * Salva una pregunta nueva para que sea moderada
 * 
 * @params json (pregunta nueva)
 */
Parse.Cloud.define("saveNewQuestion", function(request, status) {
        
    var WINHOURS = 10;
    var DIASCADUCIDADPREGUNTA = 3;
        
    var now = new Date();
    var fechaFinPregunta = new Date();
    var PreguntaNueva = Parse.Object.extend("PreguntaNueva");
    var oPreguntaNueva = new PreguntaNueva();
        
    fechaFinPregunta.setTime(fechaFinPregunta.getTime() + (DIASCADUCIDADPREGUNTA * 24 * 60 * 60 * 1000));
    oPreguntaNueva.set('acierto1',request.params.acierto1);
    oPreguntaNueva.set('acierto2',request.params.acierto2);
    oPreguntaNueva.set('acierto3',request.params.acierto3);
    oPreguntaNueva.set('acierto4',request.params.acierto4);
        
    oPreguntaNueva.set('moderarHasta',fechaFinPregunta);
    oPreguntaNueva.set('moderarDesde',now);
        
    oPreguntaNueva.set('horas', WINHOURS);
    oPreguntaNueva.set('creadorIdFB',request.params.creadorNombre);
    oPreguntaNueva.set('creadorNombre',request.params.creadorNombre);
    oPreguntaNueva.set('idioma',request.params.idioma);
    oPreguntaNueva.set('respuesta1',request.params.respuesta1);
    oPreguntaNueva.set('respuesta2',request.params.respuesta2);
    oPreguntaNueva.set('respuesta3',request.params.respuesta3);
    oPreguntaNueva.set('respuesta4',request.params.respuesta4);
    oPreguntaNueva.set('texto',request.params.texto);
         
    oPreguntaNueva.save(null, {
                    success: function(preg) {
                        status.success("Pregunta salvada");
                    },
                    error: function(error) {
                        status.error("Error: " + error.code + " " + error.message);
                    }
                  });
});
   
   
/**
 * Gestiona el tiempo apostado por un usuario
 * Horas sera negativo al salvar la apuesta y luego positivo 
 * en el caso de que no pierda todo el tiempo apostado
 * 
 * @params json (usuario, horas apostadas)
 */
Parse.Cloud.define("loadBet", function(request, status) {
        
    var query = new Parse.Query("Usuario");
    query.equalTo("objectId", request.params.userObjectId);
    query.first({    
        success: function(object) {
            var finishDate = object.get("finish_time");
            var fechaFinal = new Date(finishDate);
   
            fechaFinal.setTime(fechaFinal.getTime() + (request.params.horas * 60 * 60 * 1000));
   
            object.set('finish_time', fechaFinal);
            object.save(null, {
                success: function(rs) {
                    status.success("Apuesta salvada.");
                },
                error: function(error) {
                    status.error("Error salvando finish_time: " + error.code + " " + error.message);
                }
            }); 
   
        },
        error: function(error) {
            status.error("Error: " + error.code + " " + error.message);
        }//error
    });
});
  
  
/**
 * Cuando un usuario muere
 * 
 * @params json (usuario, horas apostadas)
 */
Parse.Cloud.define("dieProcess", function(request, status) {
        
    var query = new Parse.Query("Usuario");
    query.equalTo("objectId", request.params.userObjectId);
    query.first({    
        success: function(object) {
            var diasVidaIniciales = 5;
            var msDiasVidaIniciales = parseInt(diasVidaIniciales * (24*60*60*1000));
            var fecha = new Date();
            var reBornDate = new Date();
         
            fecha.setTime(fecha.getTime() + msDiasVidaIniciales);
   
            object.set('finish_time', fecha);
            object.set('bornAt', reBornDate);
            object.save(null, {
                success: function(rs) {
                    status.success("Jugador reiniciado.");
                },
                error: function(error) {
                    status.error("Error salvando finish_time en reborn: " + error.code + " " + error.message);
                }
            }); 
   
        },
        error: function(error) {
            status.error("Error: " + error.code + " " + error.message);
        }//error
    });
});