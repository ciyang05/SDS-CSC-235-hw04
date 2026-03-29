import pandas as pd

df = pd.read_csv('copy.csv')
df.dropna()
df.to_csv('cleaned.csv')