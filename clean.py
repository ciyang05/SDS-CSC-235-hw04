import pandas as pd
from itertools import combinations
import json

# general data cleaning

df = pd.read_csv('copy.csv')
print("rows before cleaning:", len(df))

df = df.dropna(subset=['cast', 'title', 'listed_in'])
print("rows after dropping null values in cast, title, and genres:", len(df))

df = df[df['type'] != 'TV Show']
print("rows after dropping TV shows", len(df))

df = df.drop('description', axis=1)
print("rows after dropping description column", len(df))

df = df.drop_duplicates()
print("rows after drop_duplicates: ", len(df))

# clean data w/all relevant attributes
df.to_csv('cleaned.csv', index=False)



# for force directed graph 
# since there are so many actors and movies included in this dataset, to simplify the visualization, 
# only the 30 most connected actors from the dataset appear

data = pd.read_csv('cleaned.csv')
print("rows after read: ", len(data))

print("columns: ", data.columns.tolist())
print(data.head())

if data.empty:
    raise ValueError("data_clean is empty — check your CSV path and that 'cast' column exists")

data['main'] = data['cast'].str.split(',').apply(lambda x: [a.strip() for a in x[:3]])

# edges data
edges = []
for _, row in data.iterrows():
    actors = row['main']
    for actor1, actor2 in combinations(actors, 2):
        edges.append({'source': actor1, 'target': actor2, 'movie': row['title']})

edges_df = pd.DataFrame(edges)

edges_df = edges_df.groupby(['source', 'target']).agg(
    weight = ('movie', 'count'),
    movies = ('movie', lambda x: list(x))
).reset_index()

edges_df = edges_df[edges_df['weight'] >= 1]

top_actors = set(
    edges_df['source'].value_counts().head(30).index
).union(
    edges_df['target'].value_counts().head(30).index
)
edges_df = edges_df[edges_df['source'].isin(top_actors) & edges_df['target'].isin(top_actors)]

# nodes data
active_actors = set(edges_df['source']).union(set(edges_df['target']))
nodes_df = pd.DataFrame({'id': list(active_actors)})

# converting to JSON file since it's easier to work with for graph
# orient='records' converts each row into dictionary 
nodes_final = nodes_df.to_dict(orient='records')
edges_final = edges_df.to_dict(orient='records')

print("number of edges: ", len(edges_df))
print("number of nodes: ", len(nodes_df))

with open('graph.json', 'w') as f:
    json.dump({"nodes": nodes_final, "links": edges_final}, f)


genreEdges = []

for _, row in df.iterrows():
    genres = [g.strip() for g in row['listed_in'].split(',') if g.strip()]

    for g1, g2 in combinations(sorted(genres), 2):
        genreEdges.append({
            'source':g1,
            'target': g2,
            'movie': row['title']

        })
    
genreEdgesdf = pd.DataFrame(genreEdges)

genreEdgesdf = genreEdgesdf.groupby(['source', 'target']).agg(
        value = ('movie', 'count')
        ).reset_index()
genreNodes = sorted(
        set(genreEdgesdf['source']).union(set(genreEdgesdf['target']))
    )

genreNodesdf = pd.DataFrame({'id': genreNodes})

genreNodesfinal = genreNodesdf.to_dict(orient = 'records')
genreLinksFinal = genreEdgesdf.to_dict(orient = 'records')

print("number of genre edges: ", len(genreEdgesdf))
print("number of genre nodes:", len(genreNodesdf))

with open('genreGraph.json', 'w') as f:
        json.dump({"nodes": genreNodesfinal, "links": genreLinksFinal}, f, indent = 2)
