// ==UserScript==
// @name         F1 dash board
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  try to take over the world!
// @author       You
// @match        https://f1-dash.vercel.app/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vercel.app
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var isRunning = false;

    setTimeout(function() {
        var elem = document.getElementsByTagName("footer");
        console.log(elem[0]);
        elem[0].remove();
    }, 500);


    async function checkNewRadio(){
        console.log("check");
        if (isRunning) {
            console.log("isRunning");
            return;
        }
        isRunning = true;
        console.log("azertyuiopqsdfghjklmwxcvbn,azertyuiopmlkgfdsqwxcvbn,");
        var audioTags = document.getElementsByTagName("audio");
        var len = audioTags.length;
        if (audioTags.length === 0) {
            isRunning = false;
            console.log("No audio tags found");
            return;
        }
        for (var i = 0; i < audioTags.length; i++) {
            var audioTag = audioTags[i];
            var newRadios = document.getElementsByTagName("audio");
            console.log("newRadios",newRadios.length,"audioTags",len);
            if (newRadios.length != len) {
                audioTags = newRadios;
                len = audioTags.length;
                i = 0;
                audioTag = audioTags[i];
                console.log("New radio found");
            }
            if (!audioTag.classList.contains("whispered")) {
                console.log(audioTag,i);
                var transcription = await transcribe(audioTag);
                var pTag = document.createElement("p");
                pTag.textContent = transcription;
                pTag.style.placeSelf = "start";
                pTag.style.gridColumn = "1 / span 2";
                audioTag.parentElement.parentElement.appendChild(pTag);
                pTag.style.color = pTag.parentElement.querySelector("div p").style.color;
                
            }
        }
        isRunning = false;
    }

setInterval(checkNewRadio, 5000);

async function transcribe(audio) {
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
      audio.classList.add("whispered");
      return data.transcription;
    } catch (error) {
      console.error('Erreur lors de la transcription:', error);
    }
  }


})();