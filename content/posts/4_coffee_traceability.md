---
author: "Isaac Owomugisha" 
title: "Exploring EUDR Coffee Traceability for Uganda" 
date: "2026-01-13" 
description: "Using PostGIS and GeoJSON to visualize EUDR coffee traceability for Uganda."
tags: ["spatial-data-analysis", "django", "geojson", "fullstack", "graphql", "react", "leaflet"]
---

I recently found out about EUDR (European Union Deforestation Regulation) when I was looking at a job posting from [Enveritas](https://www.enveritas.org/).
For Uganda, where coffee is a vital lifeblood for smallholder farmers, this acronym represents a significant economic shift.
The regulation is straightforward but strict: any coffee entering the EU must prove it wasn't produced on land deforested after December 31, 2020.

Motivated by the work Enveritas is doing, I wanted to explore how one could prove, with scientific certainty, that a tiny plot on a hillside in Kapchorwa or Abim was already producing coffee four years ago.

## The Data Foundation
Before I could build a dashboard, I needed data. I started by looking for a "baseline"—a record of where coffee was growing in Uganda in 2020. 
I found this through Google Earth Engine (GEE), which is essentially a massive cloud library of satellite imagery and planetary-scale datasets.

The specific data I used was a 10m-resolution probability map derived from Sentinel-2 satellites. The 10m means that every single pixel represents a `10 x 10` meter square on the ground.

The data in GEE was a Raster (basically an image) where brighter pixels meant a higher chance of coffee being there.

To build a dashboard, where we can query specific locations, I had to turn these pixels into Shapes (GeoJSON).

I used a script in the GEE Code Editor to perform a "vectorization". Essentially, the script did this: 
"Find all the pixels that have a high probability of being coffee, group the neighbors together, and draw a border around them."

Note: I scaled the 10m-resolution to 100m in the vectorization to keep the file size manageable.
```javascript
var coffeeCollection = ee.ImageCollection('projects/forestdatapartnership/assets/coffee/model_2025a').filterDate('2020-01-01', '2020-12-31');

var uganda = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017').filter(ee.Filter.eq('country_na', 'Uganda'));

var ugandaCoffee2020 = coffeeCollection.mosaic().clip(uganda);

var highProbCoffee = ugandaCoffee2020.gt(0.95).selfMask();

var coffeeVectors = highProbCoffee.reduceToVectors({
  geometry: uganda,
  crs: highProbCoffee.projection(),
  scale: 100,
  geometryType: 'polygon',
  eightConnected: false,
  labelProperty: 'zone',
  bestEffort: true
});

Export.table.toDrive({
  collection: coffeeVectors,
  description: 'Uganda_Coffee_Polygons',
  fileFormat: 'GeoJSON'
});
```

This resulted in a geojson file with over 97,000 shapes.

## The Backend (PostgresSQL, PostGIS GeoDjango)
Now that I had a geojson file, I needed to get them into a system where they could be searched, filtered and analyzed. A regular database isn't enough for this. Here's are the 3 technologies I used:
1. PostgreSQL: The "container" that stores all the data (names, IDs, dates).
2. PostGIS: a powerful extension that allows the database to store a `GEOMETRY` -- a list of coordinates that represent a real place on Earth.
3. GeoDjango: This was the bridge. It's a specific part of the Django framework that allows python to talk to the PostGIS shapes without having to write complex SQL math by hand.

Here's how a coffee plot was represented:
```python
from django.contrib.gis.db import models

class CoffeeZone(models.Model):
    gee_id = models.CharField(max_length=100)
    # This is where the magic happens:
    mpoly = models.MultiPolygonField() 
    region_name = models.CharField(max_length=100)
```

Mapping a plot to a district: In order to know which district a plot belonged to, I downloaded a geojson file of Ugandan districts shapes, added them to the database and performed a **spatial join** i.e asking the database to find which district boundary 'contains' each coffee plot.

## The Communication Layer (GraphQL)
I used GraphQL as the communication layer (with the Graphene-Django library). The challenge with map data is that it's "heavy".
If all the data is sent at once, the frontend would be slow. GraphQL allowed me to very specific: I could ask for the name of a district and only get the shapes for that specific area when a user clicks on it.

One of the most useful things I build here was a **Traceability Query**. It works like this:
1. The user clicks a point on the map.
2. The latitude and longitude are sent to the backend.
3. Django asks the databse: "Is this point inside any of our 2020 coffee plots?"
4. The API sends back a simple "Compliant" or "Non-Detect" result.

You can see the [GraphQL schema here](https://github.com/cmplx-xyttmt/uganda-coffee-traceability/blob/main/backend/map/schema.py).

## The Frontend (React & Leaflet)
I used **React** and a library for interactive maps called **Leaflet**

Early on, I realized that trying to show all 97,000 coffee shapes at once would crash most browsers. To solve this, there are 2 views:
- National View: You see the simple outlines of Uganda's districts.
- District View: When you click on a district, the map zooms in, and only then does the app fetch and display the high-resolution coffee plots for that specific area.

This kept the app fast and responsive, while still allowing the user to see the detail of the 10m satellite data.


## The Traceability Check in Action
The core goal was to make this data useful. I added a feature where you can click anywhere on the map to run an instant "Compliance Check."

When you click, the app sends your coordinates to the backend, where PostGIS performs a point-in-polygon test. If your click lands inside one of our 2020 shapes, the app confirmst the plot was established before the cutoff. If not, it marks it as "Non-Detect".


## Conclusion:
This project is a starting point. There is so much more to explore -- from adding "Change Detection" to see if forests are currently being cleared, to optimizing the system for even larger datasets.
I'm excited to keep learning and to apply these geospatial skills to the real-world challenges facing Uganda and the global coffee industry.

You can find all the [code for this project on github](https://github.com/cmplx-xyttmt/uganda-coffee-traceability).
