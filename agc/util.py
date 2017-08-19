import math
import numpy as np
import cv2

ACTIONS = ['NOOP', 'FIRE','UP','RIGHT','LEFT','DOWN','UPRIGHT','UPLEFT','DOWNRIGHT','DOWNLEFT','UPFIRE','RIGHTFIRE','LEFTFIRE','DOWNFIRE','UPRIGHTFIRE','UPLEFTFIRE','DOWNRIGHTFIRE','DOWNLEFTFIRE']

# this list is mostly needed to list the games in the same order everywhere
GAMES = ['spaceinvaders', 'qbert', 'mspacman', 'pinball','revenge']

# pretty titles for plots/tables
TITLES = {'spaceinvaders': 'Space Invaders',
          'qbert': 'Q*bert',
          'mspacman':'Ms. Pacman',
          'pinball':'Video Pinball',
          'revenge':'Montezumas\'s Revenge'
         }

def preprocess(state, resize_shape=(84,84)):
    # Resize state
    state = cv2.resize(state, resize_shape)

    if len(state.shape) == 3:
        if state.shape[2] == 3:
            state = cv2.cvtColor(state, cv2.COLOR_RGB2GRAY)

    # Check type is compatible
    if state.dtype != np.float32:
        state = state.astype(np.float32)

    # normalize
    if state.max() > 1:
        state *= 1. / 255.

    return state.reshape(-1, 84, 84)


def get_action_name(action_code):
  assert 0 <= action_code < len(ACTIONS), "%d is not the valid action index." % action_code
  return ACTIONS[action_code]

def get_action_code(action_name):
    assert action_name in ACTIONS, "%s is not the valid action name." % action_name
    return ACTIONS.index(action_name)

def env2game(name):
    ENVS = {'SpaceInvaders-v3': 'spaceinvaders', 
             'MsPacman-v3':'mspacman', 
             'VideoPinball-v3':'pinball',
             'MontezumaRevenge-v3':'revenge',
             'Qbert-v3':'qbert'
            }
    return ENVS[name]

def game2env(name):
    GAMES = {'spaceinvaders':'SpaceInvaders-v3', 
             'mspacman':'MsPacman-v3', 
             'pinball':'VideoPinball-v3',
             'revenge':'MontezumaRevenge-v3',
             'qbert':'Qbert-v3'
            }
    return GAMES[name]
