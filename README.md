# atarigrandchallenge
Code and data for 'The Grand Atari Challenge dataset' [paper](https://arxiv.org/abs/1705.10998).


Cite the Atari Grand Challenge dataset as:

*V. Kurin, S. Nowozin, K. Hofmann, L. Beyer, and B. Leibe. The Atari Grand Challenge Dataset. arXiv preprint arXiv:1705.10998, 2017.*

## Data

There are several options for you:

* [the whole dataset (screenshots + trajectories) for all five games](https://omnomnom.vision.rwth-aachen.de/data/atari_v1_release/full.tar.gz)
* [trajectories only for all five games](https://omnomnom.vision.rwth-aachen.de/data/atari_v1_release/trajectories.tar.gz)
* per-game screenshots+trajectories:
  * [Space Invaders](https://omnomnom.vision.rwth-aachen.de/data/atari_v1_release/spaceinvaders.tar.gz)
  * [Q*bert](https://omnomnom.vision.rwth-aachen.de/data/atari_v1_release/qbert.tar.gz)
  * [Ms. Pacman](https://omnomnom.vision.rwth-aachen.de/data/atari_v1_release/mspacman.tar.gz)
  * [Video Pinball](https://omnomnom.vision.rwth-aachen.de/data/atari_v1_release/pinball.tar.gz)
  * [Montezuma's Revenge](https://omnomnom.vision.rwth-aachen.de/data/atari_v1_release/revenge.tar.gz)

## Dataset API

In order to use the data in a convenient way, we release the small lib *agc*.
Installation is easy, just run this in the directory root.
 

```bash

pip3 install -e .
```

Then you can use the library in your python code:

```python

import agc.dataset as ds
import agc.util as util

# DATA_DIR is the directory, which contains the 'trajectories' and 'screens' folders
dataset = ds.AtariDataset(DATA_DIR)


# dataset.trajectories returns the dictionary with all the trajs from the dataset
all_trajectories = dataset.trajectories

```

You can find more examples in the *notebooks* folder.

**P.S.**

We've done some fixes after the initial release and removed the trajectories with final zero score from the data,
so, we have smth like 3 hrs less of replays as we claimed in the paper.
Though, we already have enough data to release a second version, so, *dataset_v2* will be here soon.
We plan to release the data and update the preprint after it.

**P.P.S**

In case you found a bug or just in trouble, email me vitaliykurin@gmail.com =)


## experimental code: TBD

## code for data collection: TBD

