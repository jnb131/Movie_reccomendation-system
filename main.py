import numpy as np
import pandas as pd
from flask import Flask, render_template, request
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

# load the nlp model and tfidf vectorizer from disk
main_data = pd.read_csv('./main_data.csv')
cosine_similarity = np.load('./cosine_similarity.npy')


def recommend_movies(m):
    m = m.lower()
    if m not in main_data['lowercase_title'].unique():
        return('Sorry! The movie you requested is not in our database. Please check the spelling or try with some other movies')
    else:
        index = main_data.loc[main_data['lowercase_title']==m].index[0]
        similarity_list =  list(enumerate(cosine_similarity[index]))
        similarity_list = sorted(similarity_list, key = lambda x:x[1] ,reverse=True)
        similarity_list = similarity_list[0:6]
        top_titles = []
        for i in range(len(similarity_list)):
            a = similarity_list[i][0]
            top_titles.append(main_data['title'][a])
        return top_titles

def get_autocomplete_suggestions():
    movie_titles_list = list(main_data['title'].str.capitalize())
    print(movie_titles_list)
    return movie_titles_list

app = Flask(__name__)

@app.route("/")
@app.route("/home")
def home():
    autocomplete_suggestions = get_autocomplete_suggestions()
    return render_template('home.html',autocomplete_suggestions=autocomplete_suggestions)

@app.route("/similarity", methods=["POST"])
def similarity():
    movie = request.form['name']
    print(movie)
    rc = recommend_movies(movie)
    if type(rc)==type('string'):
        return rc
    else:
        m_str = "---".join(rc)
        return m_str

if __name__ == '__main__':
    app.run(debug=True)