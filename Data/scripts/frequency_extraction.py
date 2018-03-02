import pandas as pd
import string
import nltk
import numpy as np
import json
import operator 
import codecs

from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
import nltk

amazon = pd.read_csv('../amazon_cells_labelled.tsv', sep='\t', index_col = False)
imbd = pd.read_csv('../imdb_labelled.tsv', sep='\t', index_col = False)
yelp = pd.read_csv('../yelp_labelled.tsv', sep='\t', index_col = False)

dict = {'amazon':{}, 'imbd':{}, 'yelp':{}}

# punctuation removal
punctuation_removal = str.maketrans(' ', ' ', string.punctuation)

# thres, how many words need to at least be present, to be output in a frequency dictionary
def get_freq_dict(df, thres = 8):
	temp = {}

	# iterate through each row
	for idx, row in df.iterrows():
		
		for word in nltk.word_tokenize(row['review'].lower().translate(punctuation_removal)):
			
			if word in stopwords.words() or word.isdigit():
				continue
				
			if word not in temp:
				temp[word] = 0
			
			temp[word] = temp[word] + 1
	
	
	todel = []
	
	# store the keys to be deleted, you cannot delete element of dictionary while iterating in the dictionary
	for key in temp:
		if temp[key] <= thres:
			todel.append(key)
	
	# delete
	for key in todel:
		del temp[key]
		
	return temp

dict['amazon'] = get_freq_dict(amazon)
dict['imbd'] = get_freq_dict(imbd)
dict['yelp'] = get_freq_dict(yelp)

with open('../bigger_frequency.json', 'w') as outfile:
    json.dump(dict, outfile, sort_keys=True, indent='\t')

print(json.dumps(dict, indent=4, sort_keys=True))

#output in csv format
file = codecs.open("../bigger_frequency.csv", "w", "utf-8")
file.write("word,source\n")

for key in dict:
	for val in dict[key]:
		temp = str(val+","+key+"\n")
		print(temp)
		file.write(temp)

'''
sorted_keys = sorted(amazon_freq, key=amazon_freq.get, reverse = True)
for key in sorted_keys:
	print(key + " , " + str(amazon_freq[key]))
'''