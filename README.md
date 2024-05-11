
# F1-dash transcription


add radio transcription to [f1-dash.com](https://f1-dash.com/)

[F1-dash Github](https://github.com/slowlydev/f1-dash/)

## Installation:
- First, clone the repo

- Then, it's using [distill-whiper](https://huggingface.co/distil-whisper) with transfomer's pipeline.

So, in order to use it you must create a [huggingface](https://huggingface.co) account and create a token.

(if you don't want to use transformers and distil-whisper go to [whisper branch](https://github.com/lucasPoret/f1-dash-whisper/tree/whisper))

Once it's done, put your token in server-whisper.py
```python
model = pipeline("automatic-speech-recognition", model="distil-whisper/distil-medium.en", device=device, token="YOUR HUGGING FACE TOKEN")
```

- install dependencies:
```
pip install -r requirement.txt
```

- You must also install the extension [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=fr&pli=1) on your browser and add the script [tamper monkey.js](https://github.com/lucasPoret/f1-dash-whisper/raw/main/tamper%20monkey.user.js)


- Because we use https, we must use certificate.
you can use the certificate in the repo and add it to your browser or generate new one with:
```
openssl req -x509 -sha256 -nodes -days 3650 -newkey rsa:4096 -keyout private.key -out certificate.crt
```

- And finally, lauch the server:
  ```
  python server-whisper.py
  ```
  Go on the website [f1-dash.com](https://f1-dash.com/) and you should see the transcription.

## More information

- if you want to change the model you can edit this line (distil-medium.en by default)
```python
  model = pipeline("automatic-speech-recognition", model="distil-whisper/distil-medium.en", device=device, token="YOUR HUGGING FACE TOKEN")
```


