# Projects

Below is a list of (open source) projects I have worked on.

## [Sunbird-AI translate](https://github.com/SunbirdAI/sunbird-ai-api)
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


## [Twitter Data Analysis for Ugandan Covid-19 Discourse on Twitter](https://github.com/SunbirdAI/covid19-uganda-twitter-data-analysis)
This project involved collecting tweets from Uganda about Covid-19 around 2020/2021. This data would then be used to extract sentiment about government SOPs put in place, track misinformation and help the Ministry of Health have more targetted messaging about the pandemic.
My contributions to this project were:
- Set up the twitter data collection pipeline.
- Labeled the data and did simple statistical analyses and visualization. 

**Technologies used**
- Python
- Twitter API
- Seaborn for data visualization
- Streamlit (for a basic interface)

## [Noise Monitoring](https://github.com/SunbirdAI/noise-sensors-monitoring)
This project aims to monitor the noise levels in Ugandan cities. We deployed noise sensors in some location and measure the decibel levels, and create reports based on environmental regulations.
My contributions to this project were:
- Established the infrastructure (including backend and frontend) to which the sensors send data. Using AWS IoT to process messages from the sensor, and a Django application to store and analyze the data.
- Setup a frontend application which shows live noise levels on a map, and provides a report of the noise levels.

**Technologies used**
- Django for the backend
- React for the frontend
- AWS IoT to receive messages from the hardware sensors.
