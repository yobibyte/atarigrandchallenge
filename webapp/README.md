# grand-atari-challenge
Can a human beat a bot in grand Atari challenge?

### Dependencies

* Flask, Flask compress
* Grunt
* PostgreSQL (add new user and give app the credentials after)
* SQLAlchemy


```bash
sudo apt-get install postgresql
pip3 install psycopg2
pip3 install flask_sqlalchemy
sudo apt-get install libpq-dev
sudo pip3 install flask_compress
sudo pip3 install flask_mobility
```

We also need to create a user and a database to make it work:

```bash
sudo adduser atari # password atari
sudo su - postgres
CREATE USER atari WITH PASSWORD 'atari'
CREATE DATABASE atari
GRANT ALL PRIVILEGES ON DATABASE atari TO atari
sudo su - atari
psql
\i path to init_db.sql
```
If you want to use nginx as a proxy, you need to enlarge the maximum size of
the request like [here](https://www.cyberciti.biz/faq/linux-unix-bsd-nginx-413-request-entity-too-large/)


### Data replaying
* dump the database into your local machine
* ./run.sh
* python replay.py

### Data cleaning

* remove trajs with final zeros
* fix reward for the first frames
* adjust the pixels (so that they are similar to gym
* remove trajectories with crazy score since fist several frames (like in MR) 
