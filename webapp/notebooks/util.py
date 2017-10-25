from os import listdir, mkdir
from os.path import join as pjoin, exists
import itertools
import pickle
from chainer.datasets import tuple_dataset
from malmopy.util import resize, rgb2gray
import shutil
import math
import numpy as np
import cv2

def preprocess(state, resize_shape=(84,84)):
    # Resize state
    state = resize(state, resize_shape)

    if len(state.shape) == 3:
        if state.shape[2] == 3:
            state = rgb2gray(state)

    # Check type is compatible
    if state.dtype != np.float32:
        state = state.astype(np.float32)
    # Scale
    if state.max() > 1:
        state *= 1. / 255.
    return state


def load_trajectories(path):
    trajectories = {}
    for game in listdir(path):
        trajectories[game] = {}
        game_dir = pjoin(path, game)
        for traj in listdir(game_dir):
            curr_traj = []
            with open(pjoin(game_dir, traj)) as f:
                for i,line in enumerate(f):
                    #first line is metadata, second is the header
                    if i > 1:
                        curr_data = line.rstrip('\n').replace(" ","").split(',')
                        curr_traj.append([int(curr_data[j]) for j in range(len(curr_data))])
                    trajectories[game][int(traj.split('.txt')[0])] = curr_traj
    return trajectories

def collapse_consecutive_zeros(trajectory):
  #be cautious since it may return [0] trajectory if the player has not done anything
  if trajectory == []:
    return []
  res = [trajectory[0]]
  res.extend([trajectory[i] for i in range(1, len(trajectory)) if not (trajectory[i] == 0 and trajectory[i-1] == 0)])
  return res

def load_split_trajectories(path, games=None):
  trajectories = {}
  if not games:
    games = listdir(path)
  for game in games:
    trajectories[game] = {}
    game_dir = pjoin(path, game)

    for type in listdir(game_dir):
      trajectories[game][type] = {}
      type_dir = pjoin(game_dir, type)
      print(type_dir)
      for traj in listdir(type_dir):
        curr_traj = []
        with open(pjoin(type_dir, traj)) as f:
          for i,line in enumerate(f):
          #first line is metadata, second is the header
            if i > 1:
              curr_data = line.rstrip('\n').replace(" ","").split(',')
              curr_traj.append([int(curr_data[j]) if j != 3 else int(curr_data[j]!='False') for j in range(len(curr_data))])
        trajectories[game][type][int(traj.split('.txt')[0])] = curr_traj
  return trajectories

def get_actions(trajectories):
  actions = {'merged':{'train':[],'valid':[],'test':[]}, 
             'mini-merged':{'train':[],'valid':[],'test':[]}}
  for g in trajectories:
    actions[g] = {}
    for type in trajectories[g]:
      actions[g][type] = [[el[4] for el in trajectories[g][type][t]] for t in trajectories[g][type]]
      actions['merged'][type].extend(actions[g][type])
      cdl = len(actions[g][type])
      actions['mini-merged'][type].extend([actions[g][type][i] for i in np.random.choice(cdl, size=cdl//5, replace=False)]) 
  return actions

def write_data(data, name):
  with open(name, 'w') as f:
    for t in data:
      f.write(' '.join(map(str, t)) + '\n')

def collapse_consecutive_zeros(trajectory):
  #be cautious since it may return [0] trajectory if the player has not done anything
  if trajectory == []:
    return []
  res = [trajectory[0]]
  res.extend([trajectory[i] for i in range(1, len(trajectory)) if not (trajectory[i] == 0 and trajectory[i-1] == 0)])
  return res

def get_action_name(action_code):
  ACTIONS = ['NOOP', 'FIRE','UP','RIGHT','LEFT','DOWN','UPRIGHT','UPLEFT','DOWNRIGHT','DOWNLEFT','UPFIRE','RIGHTFIRE','LEFTFIRE','DOWNFIRE','UPRIGHTFIRE','UPLEFTFIRE','DOWNRIGHTFIRE','DOWNLEFTFIRE']
  try:
    return ACTIONS[action_code]
  except:
    return -1

def get_action_code(action_name):
    ACTIONS = ['NOOP', 'FIRE','UP','RIGHT','LEFT','DOWN','UPRIGHT','UPLEFT','DOWNRIGHT','DOWNLEFT','UPFIRE','RIGHTFIRE','LEFTFIRE','DOWNFIRE','UPRIGHTFIRE','UPLEFTFIRE','DOWNRIGHTFIRE','DOWNLEFTFIRE']
    return ACTIONS.index(action_name)

def get_trajs_stats(trajectories, bottom_frame_limit=None, upper_frame_limit=None, remove_all_zeroes=True):
    scores = {}
    games = {}
    frames_played = {}
    rewards = {}
    terminals  = {}
    actions = {}
    for g in trajectories:
        scores[g] = []
        games[g] = 0
        frames_played[g] = []
        rewards[g] = []
        terminals[g] = []
        actions[g] = []
        for t in trajectories[g]:
            if remove_all_zeroes and trajectories[g][t][-1][2] == 0:
                continue
            cfp = 0
            cs = []
            cr = []
            ca = []
            for i in range(bottom_frame_limit if bottom_frame_limit else 0, upper_frame_limit if upper_frame_limit else len(trajectories[g][t])):
                if i < 0 or (upper_frame_limit and upper_frame_limit >= len(trajectories[g][t])):
                    break
                ca.append(trajectories[g][t][i][4])
                cs.append(trajectories[g][t][i][2])
                cr.append(trajectories[g][t][i][1])
                cfp+=1
            terminals[g].append(trajectories[g][t][upper_frame_limit - 1 if upper_frame_limit else  -1][3])
            frames_played[g].append(cfp)
            rewards[g].append(cr)
            scores[g].append(cs)
            actions[g].append(ca)
            games[g]+=1
    return scores, games, frames_played, rewards, terminals, actions

def agc_to_gym(game, pic):
    assert game in ['spaceinvaders', 'qbert', 'mspacman', 'revenge', 'pinball']
    if game == 'spaceinvaders' or 'mspacman':
        #add  bottom 1px
        #crop top    4px
        newpic = np.vstack([pic, np.zeros((1,pic.shape[1], pic.shape[2]))])[4:,:,:]
    if game == 'qbert':
        newpic = np.vstack([pic, np.zeros((7,pic.shape[1], pic.shape[2]))])[10:,:,:]
    if game == 'revenge':
        newpic = np.vstack([pic, np.zeros((2,pic.shape[1], pic.shape[2]))])[5:,:,:]
    if game == 'pinball':
        newpic = pic[:-3,:,:]
    return newpic


def load_imitation_data_bounded(data_path, game, valid_actions, score_lb=0, score_ub=math.inf, nb_transitions=None):
    screens_dir  = pjoin(data_path, 'screens', game)
    trajectories = load_trajectories(pjoin(data_path, 'trajectories'))[game]

    dataset = [] 
    total_states = 0

    shuffled_trajs = np.array(list(trajectories.keys()))
    np.random.shuffle(shuffled_trajs)

    for t in shuffled_trajs:
        st_dir   = pjoin(screens_dir, str(t))
        cur_traj = trajectories[t]
        cur_traj_len = len(listdir(st_dir)) 

        # cut off trajectories with final score before the limit
        if not score_lb <= cur_traj[-1][2] <= score_ub:
            continue

        total_states+=cur_traj_len
        pics      = np.zeros((cur_traj_len, 1, 84, 84), dtype=np.float32)
        actions   = np.zeros(cur_traj_len, dtype=np.int32)
        terminals = np.zeros(cur_traj_len, dtype=np.int32)
        rewards   = np.zeros(cur_traj_len, dtype=np.int32)
         
        for pid in range(0, cur_traj_len):

            terminal = cur_traj[pid][3] == 1
            reward   = cur_traj[pid][1]

            state = preprocess(cv2.imread(pjoin(st_dir, str(pid+1) + '.png'), cv2.IMREAD_GRAYSCALE))
            pic = state.reshape(-1, 84, 84)
            
            #convert 18 atari actions into reduced only env-valid actions
            act_name = get_action_name(cur_traj[pid][4])
            action = 0
            if act_name in valid_actions:
                action = valid_actions.index(act_name) # 0 otherwise
            dataset.append({'action':action, 'state':pic, 'reward':reward,
                             'terminal': terminal})
            
            # if nb_transitions is None, we want the whole dataset limited by lb and ub
            if nb_transitions and len(dataset) == nb_transitions:
                print("Total frames: %d" % len(dataset))
                return dataset

    #we're here if we need all the data
    return dataset

def load_imitation_data_bounded_split(data_path, game, valid_actions, score_lb, score_ub, nb_transitions=None):
    screens_dir  = pjoin(data_path, 'screens', game)
    trajectories = load_split_trajectories(pjoin(data_path, 'trajectories'), games=[game])[game]

    dataset = [] 

    for set_type in ['train', 'valid', 'test']:
        set_dir = pjoin(screens_dir, set_type)
        total_states = 0

        for t in trajectories[set_type]:
            st_dir   = pjoin(set_dir, str(t))
            cur_traj = trajectories[set_type][t]
            cur_traj_len = len(listdir(st_dir)) 

            # cut off trajectories with final score before the limit
            if score_lb <= cur_traj[-1][2] <= score_ub:
                continue

            total_states+=cur_traj_len
            pics      = np.zeros((cur_traj_len, 1, 84, 84), dtype=np.float32)
            actions   = np.zeros(cur_traj_len, dtype=np.int32)
            terminals = np.zeros(cur_traj_len, dtype=np.int32)
            rewards   = np.zeros(cur_traj_len, dtype=np.int32)
             
            for pid in range(0, cur_traj_len):

                terminal = cur_traj[pid][3] == 1
                reward   = cur_traj[pid][1]

                state = preprocess(cv2.imread(pjoin(st_dir, str(pid+1) + '.png'), cv2.IMREAD_GRAYSCALE))
                pic = state.reshape(-1, 84, 84)
                
                #convert 18 atari actions into reduced only env-valid actions
                act_name = get_action_name(cur_traj[pid][4])
                action = 0
                if act_name in valid_actions:
                    action = valid_actions.index(act_name) # 0 otherwise
                dataset.append({'action':action, 'state':pic, 'reward':reward,
                                 'terminal': terminal})
                
            # if nb_transitions is None, we want the whole dataset limited by lb and ub
            if nb_transitions and len(dataset) == nb_transitions:
                print("Total %s frames: %d" %(set_type, total_states))
                return dataset


def load_imitation_data(data_path, game, valid_actions, save=False, score_lb=0):
    screens_dir  = pjoin(data_path, 'screens', game)
    trajectories = load_split_trajectories(pjoin(data_path, 'trajectories'), games=[game])[game]
    savedir = pjoin(data_path, 'compressed')
    if not exists(savedir):
        mkdir(savedir)

    dataset = {'train':{}, 'valid':{}}

    #for set_type in ['train', 'valid']:
    for set_type in ['train']:
        set_dir = pjoin(screens_dir, set_type)
        total_states = 0

        for t in trajectories[set_type]:
            st_dir   = pjoin(set_dir, str(t))
            cur_traj = trajectories[set_type][t]
            cur_traj_len = len(listdir(st_dir)) 

            # cut off trajectories with final score before the limit
            if cur_traj[-1][2] < score_lb:
                continue

            total_states+=cur_traj_len
            pics      = np.zeros((cur_traj_len, 1, 84, 84), dtype=np.float32)
            actions   = np.zeros(cur_traj_len, dtype=np.int32)
            terminals = np.zeros(cur_traj_len, dtype=np.int32)
            rewards   = np.zeros(cur_traj_len, dtype=np.int32)
             
            for pid in range(0, cur_traj_len):
                terminals[pid] = cur_traj[pid][3] == 1
                rewards[pid]   = cur_traj[pid][1]

                state = preprocess(cv2.imread(pjoin(st_dir, str(pid+1) + '.png'), cv2.IMREAD_GRAYSCALE))
                pics[pid] = state.reshape(-1, 84, 84)
                
                #convert 18 atari actions into reduced only env-valid actions
                act_name = get_action_name(cur_traj[pid][4])
                if act_name in valid_actions:
                    actions[pid] = valid_actions.index(act_name) # 0 otherwise
            dataset[set_type][t] = {'pics'     : pics, 
                                    'actions'  : actions, 
                                    'terminals': terminals, 
                                    'rewards'  : rewards}
        if save:
            pickle.dump(dataset[set_type], open(pjoin(savedir, '%s_imi_%s.pickle' % (game, set_type)), "wb"))
        print("Total %s frames: %d" %(set_type, total_states))
    return dataset['train'], dataset['valid']

def load_AGC_data(data_path, valid_actions, game, save=False):
    screens_dir = pjoin(data_path, 'screens', game)
    trajectories = load_split_trajectories(pjoin(data_path, 'trajectories'), games=[game])[game]

    train_data = None
    valid_data = None
    
    for set_type in ['train', 'valid']:
        set_dir = pjoin(screens_dir, set_type)
        total_states = 0
        for t in listdir(set_dir):
            total_states += len(listdir(pjoin(set_dir, t)))
        print("Total %s frames: %d" %(set_type, total_states))

        pics    = np.zeros((total_states,1, 84,84), dtype=np.float32)
        actions = np.zeros(total_states,dtype=np.int32)
        terminals = np.zeros(total_states,dtype=np.int32)
        rewards = np.zeros(total_states,dtype=np.int32)
    
        ctr = 0
        for t in trajectories[set_type]:
            st_dir = pjoin(set_dir, str(t))
            cur_traj = trajectories[set_type][t]
    
            for pid in range(1, len(listdir(st_dir))):
                terminals[ctr] = is_terminal = cur_traj[pid][3] == 1
                rewards[ctr]  = cur_traj[pid][1]

                state = preprocess(cv2.imread(pjoin(set_dir, str(t), str(pid+1) + '.png'), 
                                              cv2.IMREAD_GRAYSCALE))
                pics[ctr]    = state.reshape(-1, 84, 84)
                #convert 18 atari actions into reduced only valid
                #gym atari env actions
                act_name = get_action_name(cur_traj[pid][4])
                
                gym_act_id = 0
                if act_name in valid_actions:
                    gym_act_id = valid_actions.index(act_name)

                actions[ctr] = gym_act_id             
                ctr+=1

                if (ctr)%100000==0:
                    print('Loaded %dk' % (ctr//1000))
        if set_type == 'train':
            if save:
                np.savez_compressed('../data/atari/%s_train.npz' % game, pics=pics, actions=actions, rewards=rewards, terminals=terminals)
            train_data = tuple_dataset.TupleDataset(pics, actions, rewards, terminals)
        elif set_type == 'valid':
            if save:
                np.savez_compressed('../data/atari/%s_valid.npz' % game, pics=pics, actions=actions, rewards=rewards, terminals=terminals)
            valid_data = tuple_dataset.TupleDataset(pics, actions, rewards, terminals)
    return train_data, valid_data

def load_data_npz(path):
    print('Loading ', path)
    data = np.load(path)
    return tuple_dataset.TupleDataset(data['pics'], data['actions'], data['rewards'], data['terminals'])


def env2game(name):
    GAMES = {'SpaceInvaders-v3': 'spaceinvaders', 
             'MsPacman-v3':'mspacman', 
             'VideoPinball-v3':'pinball',
             'MontezumaRevenge-v3':'revenge',
             'Qbert-v3':'qbert'
            }
    return GAMES[name]

def game2env(name):
    GAMES = {'spaceinvaders':'SpaceInvaders-v3', 
             'mspacman':'MsPacman-v3', 
             'pinball':'VideoPinball-v3',
             'revenge':'MontezumaRevenge-v3',
             'qbert':'Qbert-v3'
            }
    return GAMES[name]


def send_mail(subject, body, attachments=[]):
    #modified from http://naelshiab.com/tutorial-send-email-python/
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.mime.base import MIMEBase
    from email import encoders
    
    from credentials import PASSWORD
     
    fromaddr = "yobibyte.reports@gmail.com"
    toaddr = "vitaliykurin@gmail.com"
     
    msg = MIMEMultipart()
     
    msg['From'] = fromaddr
    msg['To'] = toaddr
    msg['Subject'] = subject
     
    msg.attach(MIMEText(body, 'plain'))
     
    filename = "NAME OF THE FILE WITH ITS EXTENSION"
    for a in attachments:
        with open(a, "rb") as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload((f).read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', "attachment; filename= %s" % a)
            msg.attach(part)
     
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(fromaddr, PASSWORD)
    text = msg.as_string()
    server.sendmail(fromaddr, toaddr, text)
    server.quit()


def get_quants(scores, percentiles):
    quantiles = {}
    for g in scores:
        final_scores = [el[-1] for el in scores[g]]
        quantiles[g] = {}
        for i in range(1, len(percentiles)):
            p = percentiles[i]
            lb = np.percentile(final_scores, percentiles[i-1])
            ub = np.percentile(final_scores, percentiles[i])
            nbgames  = len([el[-1] for el in scores[g] if lb <= el[-1] < ub])
            nbframes = sum([len(el) for el in scores[g] if lb <= el[-1] < ub])
            g_scores = [el[-1] for el in scores[g] if lb <= el[-1] < ub]
            quantiles[g][p] = {}
            quantiles[g][p]['score_lb'] = lb
            quantiles[g][p]['score_ub'] = ub
            quantiles[g][p]['qlb'] = percentiles[i-1]
            quantiles[g][p]['qub'] = percentiles[i]
            quantiles[g][p]['#games'] = nbgames
            quantiles[g][p]['#frames'] = nbframes
            quantiles[g][p]['min'] = min(g_scores)
            quantiles[g][p]['max'] = max(g_scores)
            quantiles[g][p]['avg_score'] = np.mean(g_scores)
            quantiles[g][p]['stddev'] = np.std(g_scores)
    return quantiles

def play_eval_game(monitor, model, eval_eps=0.05):
    score = 0
    observation = monitor.reset()
    last_states = [preprocess(observation)]

    #input consists of four frames
    for _ in range(3):
        o, _, _, _ = monitor.step(0)
        last_states.append(preprocess(o))

    for _ in range(100000):
        if np.random.random() < eval_eps:
            action = monitor.action_space.sample()
        else:
            action = model.evaluate(np.array([last_states])).argmax()
        last_states.pop(0)
        observation, reward, done, _ = monitor.step(action)
        score+=reward
        last_states.append(preprocess(observation))
        if done:   
            return score
