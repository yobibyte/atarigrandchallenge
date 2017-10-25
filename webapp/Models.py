from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Action(db.Model):
  __tablename__ = 'actions'
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String)

class Game(db.Model):
  __tablename__ = 'games'
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String)
  rom = db.Column(db.String)
  ai_score = db.Column(db.Integer)
  
class PlayerType(db.Model):
  __tablename__ = 'player_types'
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String)

class Trajectory(db.Model):
  __tablename__ = 'trajectories'
  id = db.Column(db.Integer, primary_key=True)
  game_id = db.Column(db.Integer, db.ForeignKey(Game.id))
  player_type_id = db.Column(db.Integer, db.ForeignKey(PlayerType.id))
  init_state = db.Column(db.String)
  actions = db.Column(db.String)
  final_score = db.Column(db.Integer)
