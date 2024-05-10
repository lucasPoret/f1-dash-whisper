from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import torch
import time




app = Flask(__name__)
CORS(app)
print("Chargement du modèle...")
# Vérifie si CUDA est disponible et configure PyTorch pour utiliser le GPU
if torch.cuda.is_available():
    print("CUDA est disponible. Modèle en cours de configuration pour utiliser le GPU.")
    device = torch.device("cuda")
else:
    print("CUDA n'est pas disponible. Modèle en cours de configuration pour utiliser le CPU.")
    device = torch.device("cpu")

model = whisper.load_model("medium.en").to(device) # ou "small", "medium", "large" selon les ressources disponibles
print("Modèle chargé")

#dict to store the transcription
transcription_list = dict()


@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    # Vérifie si le fichier fait partie de la requête
    audio_url = request.json.get('audio')  # Obtient l'URL de l'audio depuis la requête
    if not audio_url:
        return "URL de l'audio manquant", 400
    print(f"Transcription de l'audio à l'URL: {audio_url}")

    if audio_url in transcription_list: 
        return jsonify(transcription=transcription_list[audio_url])
    
   
    try:
        start_time = time.time()
        # Transcrit le fichier audio    
        result = model.transcribe(audio_url, language="en")
        transcription = result["text"]
        transcription_list[audio_url] = transcription
        end_time = time.time()
        print(f"Temps d'exécution: {end_time - start_time} secondes")

    except:
        transcription = "trasncription failed"

    print(f"Transcription: {transcription}")
    return jsonify(transcription=transcription)

@app.route('/reset', methods=['POST'])
def resetList():
    transcription_list.clear()
    #return no content
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
    app.run(debug=True, ssl_context='adhoc')
