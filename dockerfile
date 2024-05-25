# Utiliser l'image de base Python 3.11
FROM python:3.11

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers requirements et le script dans le conteneur
COPY requirements.txt requirements.txt
COPY server-whisper.py server-whisper.py

# Copier les fichiers de certificat et de clé privée
COPY certificate.crt /etc/ssl/certs/certificate.crt
COPY private.key /etc/ssl/private/private.key

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Installer ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copier le script de démarrage
COPY start.sh /usr/local/bin/start.sh

# Ajouter les permissions d'exécution au script
RUN chmod +x /usr/local/bin/start.sh

# Ajouter des alias pour les commandes transcription
RUN echo "alias transcription='/usr/local/bin/start.sh'" >> /root/.bashrc

# Exposer le port 5000
EXPOSE 5000

# Démarrer le script et garder le conteneur actif
CMD /usr/local/bin/start.sh start && tail -f /dev/null
