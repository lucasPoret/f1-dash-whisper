// ==UserScript==
// @name         F1 dash board
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  try to take over the world!
// @author       You
// @match        https://f1-dash.vercel.app/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vercel.app
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var isRunning = false;
    var last_five=[];
    var list=[];

    setTimeout(function() {
        var elem = document.getElementsByTagName("footer");
        console.log(elem[0]);
        elem[0].remove();
    }, 500);

    function updateLastFive(audioTags){
      // Convert audioTags collection into an array
      var audioArray = Array.from(audioTags);
      //take five last items of the list
      var last = audioArray.slice(-5);
      //add the src of the audio tag to the list last_five
      last.forEach(function(element){
        last_five.push(element.src);
      });
    }

    function addNewRadio(list,element,size){
        if (list.length === size){
          //récupère le premier élément de la liste last_five et le supprime de la liste list
          var last = last_five.shift();
          //find where the key in the list is equal to last and remove it
          list.splice(list.findIndex(x => x.audioUrl === last),1);
        }
        list.push(element);
    }

    function addTranscriptionToHtml(audio,Transcription){
      audio.classList.add("whispered");
      var pTag = document.createElement("p");
      pTag.textContent = Transcription;
      pTag.style.placeSelf = "start";
      pTag.style.gridColumn = "1 / span 2";
      audio.parentElement.parentElement.appendChild(pTag);
      pTag.style.color = pTag.parentElement.querySelector("div p").style.color;
    }

    function updateRadioList(list,audioTags){
      // Convert audioTags collection into an array
      var audioArray = Array.from(audioTags);

      //verifie si pour chqaue element de audioTags.src si il est dans la liste list et si oui affiche la transcriptionhtml
      audioArray.forEach(function(element){
        list.forEach(function(element2){
          if (element.src === element2.audioUrl && !element.classList.contains("whispered")){
            addTranscriptionToHtml(element,element2.transcription);
          }
        });
      });
    }




    async function checkNewRadio(){
        //console.log("check");
        if (isRunning) {              //check if the function is already running
            //console.log("isRunning");
            return;
        }
        isRunning = true;
        //console.log("azertyuiopqsdfghjklmwxcvbn,azertyuiopmlkgfdsqwxcvbn,");
        var audioTags = document.getElementsByTagName("audio");  //get all the audio tags
        updateLastFive(audioTags);

        if (audioTags.length === 0) { //if there is no audio tags, stop the function
            isRunning = false;
            console.log("No audio tags found");
            return;
        }


        for (var i = 0; i < audioTags.length; i++) {

            var audioTag = audioTags[i];

            //check if there is a new radio
            var newRadios = document.getElementsByTagName("audio");
            if (!newRadios[0].classList.contains("whispered")){
                audioTags = newRadios;
                i = 0;
                audioTag = audioTags[i];
                updateLastFive(audioTags);
                console.log("New radio found");
                updateRadioList(list,audioTags);
                console.log("list",list);
            }


            //check if the radio is not already in the list then process it
            if (!audioTag.classList.contains("whispered")) {
                console.log(audioTag,i);
                await transcribe(audioTag);


            }
        }
        isRunning = false;
    }

setInterval(checkNewRadio, 5000);

async function transcribe(audio) {  //transcribe the audio
    var audioUrl = audio.src;
    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: audioUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('Transcription:', data.transcription);

      //add the transcription to the html
      addTranscriptionToHtml(audio,data.transcription);

      //dict with key=source of the audio and value=transcription
      addNewRadio(list,{audioUrl:audio.src,transcription:data.transcription},146);


      return data.transcription;
    } catch (error) {
      console.error('Erreur lors de la transcription:', error);
    }
  }


})();