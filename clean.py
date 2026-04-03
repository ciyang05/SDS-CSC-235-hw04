import pandas as pd
from itertools import combinations
import json

df = pd.read_csv('copy.csv')
df.dropna()
df.to_csv('cleaned.csv')

df = df[df['type'] != 'TV Show']
df.to_csv('updated.csv')

df = df.drop('description', axis=1)
df.to_csv('final updated.csv')

# for force directed graph 
data = pd.read_csv('force data.csv')
data.dropna()
data_clean = data.drop_duplicates()

data_clean = data_clean.dropna(subset=['cast'])
data_clean['main'] = data_clean['cast'].str.split(',').apply(lambda x: [a.strip() for a in x[:3]])

# edges data
edges = []
for _, row in data_clean.iterrows():
    actors = row['main']
    for actor1, actor2 in combinations(actors, 2):
        edges.append({'source': actor1, 'target': actor2, 'movie': row['title']})

edges_df = pd.DataFrame(edges)

edges_df = edges_df.groupby(['source', 'target']).agg(
    weight = ('movie', 'count'),
    movies = ('movie', list)
).reset_index()


# nodes data
nodes = []

for _, row in data_clean.iterrows():
    actors = row['main']
    for actor in actors:
        nodes.append(actor)

nodes_df = pd.DataFrame({'Actor': list(nodes)})

# converting to JSON file since it's easier to work with for graph
# orient='records' converts each row into dictionary 
nodes_final = nodes_df.to_dict(orient='records')
edges_final = edges_df.to_dict(orient='records')

with open('graph.json', 'w') as f:
    json.dump({"nodes": nodes_final, "links": edges_final}, f)