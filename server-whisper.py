from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import torch



app = Flask(__name__)
CORS(app) # Active CORS pour toutes les origines
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

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    # Vérifie si le fichier fait partie de la requête
    audio_url = request.json.get('audio')  # Obtient l'URL de l'audio depuis la requête
    if not audio_url:
        return "URL de l'audio manquant", 400
    print(f"Transcription de l'audio à l'URL: {audio_url}")
    try:
        # Transcrit le fichier audio    
        result = model.transcribe(audio_url, language="en")
        transcription = result["text"]
    except:
        transcription = "La transcription n'a pas été possible, le contenu audio n'a pas pu être compris."

    print(f"Transcription: {transcription}")
    return jsonify(transcription=transcription)

if __name__ == '__main__':
    app.run(debug=True)
