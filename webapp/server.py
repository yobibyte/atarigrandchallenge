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


from PIL import Image
from io import BytesIO
import base64
import cv2

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = '.'
app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 4 #4mb
Mobility(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://'+DB_USER+':'+DB_PASSWORD+'@localhost/atari'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
Compress(app)

percentiles = np.arange(1, 101)

def get_scores(rom):
  scores = db.session.query(Trajectory.final_score).filter(Trajectory.game_id==Game.id).filter(Game.rom==rom).all()
  return [s[0] for s in scores]

@app.route('/api/quantiles/<rom>')
def get_quantiles(rom):
  scores = get_scores(rom)
  if len(scores) == 0:
    return make_response(json.dumps([0.0]*100))
  return make_response(json.dumps(list(np.percentile(scores, percentiles))))

@app.route('/')
@mobile_template('{mobile/}index.html')
def index(template):
  rom = random.choice(['qbert', 'spaceinvaders', 'mspacman', 'pinball', 'revenge']) 
  ai_score = Game.query.filter_by(rom=rom).first().ai_score
  return render_template(template, rom=rom, ai_score=ai_score)

@app.route('/<rom>')
@mobile_template('/{mobile/}index.html')
def index_rom(template, rom):
  if(rom not in ['qbert', 'spaceinvaders', 'mspacman', 'pinball', 'revenge']):
    return redirect('/')
  ai_score = Game.query.filter_by(rom=rom).first().ai_score
  return render_template(template, rom=rom, ai_score=ai_score)

@app.route('/api/save', methods=['POST'])
def save_sequence():
  resp = request.get_json();
  print('============================') 
  trajectory = Trajectory(game_id = resp['game_id'], player_type_id = 1, init_state = json.dumps(resp['init_state']), actions = json.dumps(resp['trajectory']), final_score=resp['final_score'])
  #get traj id here
  db.session.add(trajectory)
  db.session.commit()
  return str(trajectory.id), 200 

@app.route('/about')
@mobile_template('/{mobile/}about.html')
def about(template):
  return render_template(template)

@app.route('/data')
@mobile_template('/data.html')
def data(template):
  return render_template(template)


@app.route('/api/testsave', methods=['POST'])
def test_save():
  resp = request.get_json();
  data = resp['screenshot'].split(',')[1]
  w = resp['width']
  h = resp['height']
  im = Image.open(BytesIO(base64.b64decode(data)))
  im = im.crop((0,0,w,h))
  im.save("test.png");
  return 'screenshot save', 200

### dataset util stuff
DATASET_PATH = 'data/'
@app.route('/api/save_trajectory', methods=['POST'])
def save_trajectory():
  resp = request.get_json()
  rom = resp['rom']
  if rom not in ['qbert', 'spaceinvaders', 'mspacman', 'pinball', 'revenge']:
    return 'Unknown rom', 400
  traj = resp['trajectory']
  # get last file in the folder num
  rom_dir = os.path.join(DATASET_PATH, 'trajectories', rom)
  dir_files = os.listdir(rom_dir)
  fn = 0 #start naming from 0
  if len(dir_files) > 0:
    dir_files.sort(key=lambda x: int(x.split('.txt')[0]))
    fn = int(dir_files[-1].split('.txt')[0])+1
  with open(os.path.join(rom_dir, str(fn)) + '.txt', 'w') as f:
    f.write('db traj id : %d\n' % resp['seqid'])
    f.write('frame,reward,score,terminal,action\n')
    for k in sorted(traj.keys(), key=int):
      ct = traj[k]
      f.write('%s,%s,%s,%d,%s\n' % (k,ct['reward'],ct['score'],int(ct['terminal']),ct['action']))
  os.mkdir(os.path.join(DATASET_PATH, 'screens', rom, str(fn)))
  return 'sequence saved', 200

@app.route('/api/save_frame', methods=['POST'])
def save_frame():
  resp = request.get_json();
  rom = resp['rom']
  rom_dir = os.path.join(DATASET_PATH, 'screens', rom)
  dir_files = os.listdir(rom_dir)
  dir_files.sort(key=int)

  fn = 0 
  seq_dir = os.path.join(rom_dir, dir_files[-1])
  seq_files = os.listdir(seq_dir)
  if len(seq_files) > 0:
    seq_files.sort(key=lambda x: int(x.split('.png')[0]))
    fn = int(seq_files[-1].split('.png')[0])+1
  
  data = resp['screenshot'].split(',')[1]
  w = resp['width']
  h = resp['height']
  im = Image.open(BytesIO(base64.b64decode(data)))
  im = im.crop((0,0,w,h))
  pic_path = os.path.join(seq_dir, str(fn))+".png"
  print(pic_path)
  im.save(pic_path)

  return 'screenshot saved', 200


### replay stuff
@app.route('/replay/<traj_id>')
def replay(traj_id):
  return render_template('index.html', replay=True, traj_id = traj_id)

@app.route('/api/trajectory/<trajectory_id>')
def get_trajectory(trajectory_id):
  traj = Trajectory.query.filter_by(id=trajectory_id).first()
  rom = Game.query.filter_by(id=traj.game_id).first().rom
  return jsonify(**{'trajectory':json.loads(traj.actions), 'init_state':json.loads(traj.init_state), 'rom':rom, 'seqid':traj.id}) 
