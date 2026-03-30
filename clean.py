import pandas as pd

df = pd.read_csv('copy.csv')
df.dropna()
df.to_csv('cleaned.csv')

df = df[df['type'] != 'TV Show']
df.to_csv('updated.csv')

df = df.drop('description', axis=1)
df.to_csv('final updated.csv')