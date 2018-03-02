import pandas as pd
import string
import nltk
import numpy as np
import json
import operator 

amazon = pd.read_csv('../amazon_cells_labelled.tsv', sep='\t', index_col = False)
imbd = pd.read_csv('../imdb_labelled.tsv', sep='\t', index_col = False)
yelp = pd.read_csv('../yelp_labelled.tsv', sep='\t', index_col = False)

sent = {'amazon':{'negative':0, 'positive':0}, 'imbd':{'negative':0, 'positive':0}, 'yelp':{'negative':0, 'positive':0}}

# iterate through each row
for idx, row in amazon.iterrows():
	if row['sentiment'] == 1:
		sent['amazon']['positive'] = sent['amazon']['positive'] + 1
	else:
		sent['amazon']['negative'] = sent['amazon']['negative'] + 1
		
for idx, row in imbd.iterrows():
	if row['sentiment'] == 1:
		sent['imbd']['positive'] = sent['imbd']['positive'] + 1
	else:
		sent['imbd']['negative'] = sent['imbd']['negative'] + 1
		
for idx, row in yelp.iterrows():
	if row['sentiment'] == 1:
		sent['yelp']['positive'] = sent['yelp']['positive'] + 1
	else:
		sent['yelp']['negative'] = sent['yelp']['negative'] + 1

print(json.dumps(sent, indent=4, sort_keys=True))
'''
sorted_keys = sorted(amazon_freq, key=amazon_freq.get, reverse = True)
for key in sorted_keys:
	print(key + " , " + str(amazon_freq[key]))
'''