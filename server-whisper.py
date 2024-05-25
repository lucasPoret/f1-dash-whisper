from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import torch
import time
from threading import Lock

app = Flask(__name__)
CORS(app)
lock = Lock()
print("Chargement du modèle...")

# Vérifie si CUDA est disponible et configure PyTorch pour utiliser le GPU
if torch.cuda.is_available():
    print("CUDA est disponible. Modèle en cours de configuration pour utiliser le GPU.")
    device = torch.device("cuda")
else:
    print("CUDA n'est pas disponible. Modèle en cours de configuration pour utiliser le CPU.")
    device = torch.device("cpu")

model_name = "distil-whisper/distil-small.en"  # Valeur par défaut
model = pipeline("automatic-speech-recognition", model=model_name, device=device)
print(f"Modèle {model_name} chargé")

# dict to store the transcription
transcription_list = dict()

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    with lock:
        audio_url = request.json.get('audio')  # Obtient l'URL de l'audio depuis la requête
        if not audio_url:
            return "URL de l'audio manquant", 400
        print(f"\nTranscription de l'audio à l'URL: {audio_url}\n")

        if audio_url in transcription_list: 
            print(f"\nTranscription in list")
            return jsonify(transcription=transcription_list[audio_url])
        
        try:
            start_time = time.time()
            result = model(audio_url)
            transcription = result["text"]
            transcription_list[audio_url] = transcription
            end_time = time.time()
            print(f"\nTemps de transcription: {end_time - start_time} secondes")

        except Exception as e:
            transcription = "transcription failed"
            print(f"Error occurred during transcription: {str(e)}")

        print(f"\nTranscription: {transcription}\n")
        return jsonify(transcription=transcription)

@app.route('/reset', methods=['POST'])
def resetList():
    transcription_list.clear()
    return '', 204

@app.route('/removeItem', methods=['POST'])
def removeItem():
    audio_url = request.json.get('audio')
    if not audio_url:
        return "URL de l'audio manquant", 400
    if audio_url in transcription_list:
        del transcription_list[audio_url] 
        return '', 204
    
@app.route('/getList', methods=['GET']) 
def getList():
    return jsonify(transcription_list)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, ssl_context=('/etc/ssl/certs/certificate.crt', '/etc/ssl/private/private.key'), threaded=True, port=5000)
