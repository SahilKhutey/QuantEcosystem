#!/bin/bash

# heroku/deploy-heroku.sh

# Log in
heroku login

# Create app
heroku create data-monitoring-dashboard

# Add Heroku buildpacks
heroku buildpacks:set heroku/python
heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-streamlit

# Set production environment variables
heroku config:set STREAMLIT_SECRET_KEY="your_strong_secret_key"

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku master

# Open app
heroku open
