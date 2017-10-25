CREATE TABLE games        (id serial PRIMARY KEY, name text, rom text, ai_score integer);
CREATE TABLE actions      (id serial PRIMARY KEY, name text);
CREATE TABLE player_types (id serial PRIMARY KEY, name text);

CREATE TABLE trajectories (
                            id serial PRIMARY KEY, 
                            game_id integer REFERENCES games(id),
                            player_type_id integer REFERENCES player_types(id), 
                            init_state text, 
                            actions text, 
                            final_score integer
                          );

INSERT INTO player_types(id, name) VALUES (0, 'bot');
INSERT INTO player_types(id, name) VALUES (1, 'human');

INSERT INTO games(id, name, rom, ai_score) VALUES (0, 'Q*bert', 'qbert', 10596);
INSERT INTO games(id, name, rom, ai_score) VALUES (1, 'Video Pinball', 'pinball', 42684);
INSERT INTO games(id, name, rom, ai_score) VALUES (2, 'Ms. Pacman', 'mspacman', 2311);
INSERT INTO games(id, name, rom, ai_score) VALUES (3, 'Space Invaders', 'spaceinvaders', 1976);
INSERT INTO games(id, name, rom, ai_score) VALUES (4, 'Montezuma''s revenge', 'revenge', 1);

INSERT INTO actions(id, name) VALUES (0, 'NOOP');
INSERT INTO actions(id, name) VALUES (1, 'FIRE');
INSERT INTO actions(id, name) VALUES (2, 'UP');
INSERT INTO actions(id, name) VALUES (3, 'RIGHT');
INSERT INTO actions(id, name) VALUES (4, 'LEFT');
INSERT INTO actions(id, name) VALUES (5, 'DOWN');
INSERT INTO actions(id, name) VALUES (6, 'UPRIGHT');
INSERT INTO actions(id, name) VALUES (7, 'UPLEFT');
INSERT INTO actions(id, name) VALUES (8, 'DOWNRIGHT');
INSERT INTO actions(id, name) VALUES (9, 'DOWNLEFT');
INSERT INTO actions(id, name) VALUES (10, 'UPFIRE');
INSERT INTO actions(id, name) VALUES (11, 'RIGHTFIRE');
INSERT INTO actions(id, name) VALUES (12, 'LEFTFIRE');
INSERT INTO actions(id, name) VALUES (13, 'DOWNFIRE');
INSERT INTO actions(id, name) VALUES (14, 'UPRIGHTFIRE');
INSERT INTO actions(id, name) VALUES (15, 'UPLEFTFIRE');
INSERT INTO actions(id, name) VALUES (16, 'DOWNRIGHTFIRE');
INSERT INTO actions(id, name) VALUES (17, 'DOWNLEFTFIRE');
