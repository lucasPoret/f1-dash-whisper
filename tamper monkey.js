  // ==UserScript==
  // @name         F1 dash board
  // @namespace    http://tampermonkey.net/
  // @version      1.1.2
  // @description  try to take over the world!
  // @author       You
  // @match        https://f1-dash.com/
  // @icon         https://www.google.com/s2/favicons?sz=64&domain=vercel.app
  // @grant        none
  // ==/UserScript==

  (function() {
      'use strict';
      var isRunning = false;
      // var last_five=[];
      // var list=[];

      setTimeout(function() {
          var elem = document.getElementsByTagName("footer");
          console.log(elem[0]);
          elem[0].remove();
          // var audioTags = document.getElementsByTagName("audio");
          // updateRadioList(audioTags);
      }, 500);


      async function addTranscriptionToHtml(audio,Transcription){
        console.log("adding transcription to html ");
        audio.classList.add("whispered");
        var pTag = document.createElement("p");
        pTag.textContent = Transcription;
        pTag.style.placeSelf = "start";
        pTag.style.gridColumn = "1 / span 2";
        audio.parentElement.parentElement.appendChild(pTag);
        pTag.style.color = pTag.parentElement.querySelector("div p").style.color;
      }

      async function updateRadioList(audioTags){
        var dict = [];
        var audioArray = Array.from(audioTags);
        //ger list from server and update the list
        await fetch('https://127.0.0.1:5000/getList', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then(response => response.json())
        .then(data => {
          dict = data;
          
        });

        console.log(Object.entries(dict));
        //verifie si pour chqaue element de audioTags.src si il est dans la liste list et si oui affiche la transcriptionhtml
        audioArray.forEach(function(element){
          Object.entries(dict).forEach(([key, value]) => {
            //if an element of list exists in audioTags.src then add the transcription to the html
            if (element.src === key && !element.classList.contains("whispered")){
              addTranscriptionToHtml(element, value);
            }
            else if (element.src === key && element.classList.contains("whispered")){ //if whisperred erase the existing <p> tag
              element.classList.remove("whispered");
              var pTag = element.parentElement.parentElement.querySelector("p");
              pTag.remove();
              addTranscriptionToHtml(element, value);
            }
            //if an element of list does not exist in audioTags.src then remove it from the list of the server with fetch removeItem
            else if (!audioArray.some(e => e.src === key)){ 
              fetch('https://127.0.0.1:5000/removeItem', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ audio: key }),
              });
              //remove the element from the dict
              delete dict[key];
            }
            

          });
        });

      }
      

      function resetServerList(){
        fetch('https://127.0.0.1:5000/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }

      async function checkNewRadio(){
          // console.log("check");
          if (isRunning) {              //check if the function is already running
              //console.log("isRunning");
              return;
          }
          isRunning = true;
          //console.log("azertyuiopqsdfghjklmwxcvbn,azertyuiopmlkgfdsqwxcvbn,");
          var audioTags = document.getElementsByTagName("audio");  //get all the audio tags
         
          // updateRadioList(audioTags);
          
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
                  console.log("New radio found");
                  await updateRadioList(audioTags);
              }

              if (!audioTag.classList.contains("whispered")) {
                  console.log(audioTag,i);
                  await transcribe(audioTag,0);
              }
          }
          isRunning = false;
      }

  setInterval(checkNewRadio, 100);

  async function transcribe(audio,retry) {  //transcribe the audio
      var audioUrl = audio.src;
      try {
        const response = await fetch('https://127.0.0.1:5000/transcribe', {
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

        if(data.transcription === "trasncription failed"){// retry the transcription
          console.log("retrying");
          if (retry < 5){
            await transcribe(audio,retry+1);
          }
          else{
            console.log("transcription failed");
            return;
          }
        }

        else{
          //add the transcription to the html
          addTranscriptionToHtml(audio,data.transcription);
    
          return data.transcription;
        }
      } catch (error) {
        console.error('Erreur lors de la transcription:', error);
      }
    }


  })();