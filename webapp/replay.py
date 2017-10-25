import os
import random
from keys import *
from flask import Flask, render_template, request, jsonify, make_response, redirect
from flask_compress import Compress
from flask_sqlalchemy import SQLAlchemy
from Models import db, Action, Game, Trajectory
import json
import numpy as np
from flask_mobility import Mobility
from flask_mobility.decorators import mobile_template

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
FLASK_ADDR = "127.0.0.1:4242"

app = Flask("replay_app")
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 4 #4mb
Mobility(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://'+DB_USER+':'+DB_PASSWORD+'@localhost/atari'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
Compress(app)

with app.app_context():
  driver = webdriver.Firefox()
  # ids are all the ids for the trajectories we collected
  # TODO limit request to cancel the trajectories we do not need, e.g. empty ones
  ids = db.session.query(Trajectory.id).all()
  # for each id run replay
  for i in ids:
    print('Replaying %d traj' % i)
    # inside each frame of the replay, we get the screenshot and
    # send ajax request to another server with trajectory, rom name and the screnshot
    # the server save screenshot and the trajectory to dirs based on rom name
    driver.get("http://%s/replay/%d" % (FLASK_ADDR,i))
    max_wait_time = driver.execute_script("return Javatari.room.console.traj_max_frame;")/60 + 20 # +20 sec to be sure
    try: 
      element = WebDriverWait(driver, max_wait_time).until(EC.alert_is_present())
      alert = driver.switch_to_alert()
      alert.accept()
    except TimeoutException:
      print('timeout exception')
