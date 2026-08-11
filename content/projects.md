# Projects

A mix of things I've built: some for work, some for people I care about, and some just to learn.

## Personal projects

### [Acu2Brain](https://github.com/cmplx-xyttmt/acu-2brain) *(in development)*
A personal knowledge and self-improvement tool built around one loop: **capture → resurface →
train → engage** — somewhere between a "second brain" and a spaced-repetition trainer, with
semantic search over the things you capture. Currently building it out; deploying soon.

**Technologies used**
- Django + DRF (backend)
- Next.js + Tailwind (web)
- PostgreSQL with pgvector (embeddings / semantic search)
- Redis

### [AcuGemma](https://github.com/cmplx-xyttmt/acu-gemma)
An offline-first, on-device AI tutoring app aimed at primary-school learners in rural Uganda,
built for the Google Gemma 3n hackathon. I wrote about the motivation and design in
[AcuGemma Version 0.1]({{< relref "posts/3_acugemma" >}}).

**Technologies used**
- Android (Kotlin)
- Gemma 3n (on-device LLM)
- MediaPipe

### [Uganda Coffee Traceability](https://github.com/cmplx-xyttmt/uganda-coffee-traceability)
A prototype for EUDR (EU Deforestation Regulation) coffee traceability in Uganda: mapping farm
plots and helping prove that coffee wasn't grown on land deforested after 2020. Write-up:
[Exploring EUDR Coffee Traceability for Uganda]({{< relref "posts/4_coffee_traceability" >}}).

**Technologies used**
- Django + GraphQL (backend)
- PostGIS / GeoJSON (spatial data)
- React + Leaflet (map frontend)

## Learning by building

### [Cryptopals](https://github.com/cmplx-xyttmt/cryptopals)
Working through the [Cryptopals](https://cryptopals.com/) cryptography challenges to learn crypto
from the ground up: using an AI as a learning guide (critiquing my code rather than writing it),
and building small interactive visualizations for the trickier ideas. The full story is in
[Learning Cryptography with an AI Guide]({{< relref "posts/6_cryptopals_ai_tutor" >}}) — and it's
an ongoing series.

**Technologies used**
- Python (+ pytest)
- Vanilla HTML / JS for the interactive artifacts

## At Sunbird AI

### [Sunbird-AI translate](https://github.com/SunbirdAI/sunbird-ai-api)
Sunbird AI translate is a translation platform for Ugandan languages to and from English. I worked on this project while working at Sunbird AI.
Notable contributions I made to the project were:
- Deployed the AI models to the cloud (AWS and later on GCP).
- Lead developer of the Sunbird-AI-Translate API. Worked on the backend and deployment aspects.
- Built the frontend for the translation portal.

**Technologies used**
- FastAPI for the backend
- GCP Vertex AI for model deployment
- GCP Cloud Run for app deployment.
- React for the translation portal frontend

### [Twitter Data Analysis for Ugandan Covid-19 Discourse on Twitter](https://github.com/SunbirdAI/covid19-uganda-twitter-data-analysis)
This project involved collecting tweets from Uganda about Covid-19 around 2020/2021. This data would then be used to extract sentiment about government SOPs put in place, track misinformation and help the Ministry of Health have more targetted messaging about the pandemic.
My contributions to this project were:
- Set up the twitter data collection pipeline.
- Labeled the data and did simple statistical analyses and visualization. 

**Technologies used**
- Python
- Twitter API
- Seaborn for data visualization
- Streamlit (for a basic interface)

### [Noise Monitoring](https://github.com/SunbirdAI/noise-sensors-monitoring)
This project aims to monitor the noise levels in Ugandan cities. We deployed noise sensors in some location and measure the decibel levels, and create reports based on environmental regulations.
My contributions to this project were:
- Established the infrastructure (including backend and frontend) to which the sensors send data. Using AWS IoT to process messages from the sensor, and a Django application to store and analyze the data.
- Setup a frontend application which shows live noise levels on a map, and provides a report of the noise levels.

**Technologies used**
- Django for the backend
- React for the frontend
- AWS IoT to receive messages from the hardware sensors.
