import unittest

import argparse
import sys

from agc.dataset import AtariDataset


class AgcTest(unittest.TestCase):
    DATASET_PATH = '/media/HDD1/data/atari_170306_corrected/'
    GAMES = set(['spaceinvaders', 'qbert', 'mspacman', 'pinball', 'revenge'])


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.dataset = AtariDataset(AgcTest.DATASET_PATH)
        

    def test_game_set(self):
        self.assertEqual(set(self.dataset.trajectories.keys()), AgcTest.GAMES)
    
if __name__ == '__main__':
    unittest.main()
