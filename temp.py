import pandas as pd
from ast import literal_eval
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

credits = pd.read_csv('./Recommendation-Systems-main/movies_dataset/tmdb_5000_credits.csv')
movies = pd.read_csv('./Recommendation-Systems-main/movies_dataset/tmdb_5000_movies.csv')


def get_director(x):
    for i in x:
        if i['job'] == 'Director':
            return i['name']
    return ""

def get_list(x):
    if isinstance(x, list):
        names = [i['name'] for i in x]
        #Check if more than 3 elements exist. If yes, return only first three. If no, return entire list.
        if len(names) > 3:
            names = names[:3]
        return names

    #Return empty list in case of missing/malformed data
    return []

def clean_data(x):
    if isinstance(x, list):
        return ' '.join([str.lower(i.replace(" ", "")) for i in x])
    else:
        #Check if director exists. If not, return empty string
        if isinstance(x, str):
            return str.lower(x.replace(" ", ""))
        else:
            return ''

def create_main_dataset():
    main_data = pd.merge(left=credits, right=movies, left_on='movie_id', right_on='id')
    # print(credits['title'])
    # print("MAIN DATA COLUMN NAMES: ")
    # print(main_data['title_x'] == main_data['title_y'])
    main_data.drop(['title_y'], axis = 1)
    main_data.rename(columns = {'title_x':'title'}, inplace = True)
    main_data['lowercase_title'] = main_data['title'].apply(lambda x: x.lower())
    # print(main_data['lowercase_title'])
    # features = ['cast', 'crew', 'keywords', 'genres']
    # for feature in features:
    #     df2[feature] = df2[feature].apply(literal_eval)
    features = ['cast', 'crew', 'keywords', 'genres']
    for feature in features:
        main_data[feature] = main_data[feature].apply(literal_eval)

    # df2['director'] = df2['crew'].apply(get_director)
    main_data['director'] = main_data['crew'].apply(get_director)

    # df['Name'] = df[['First', 'Last']].apply(lambda x: ' '.join(x), axis = 1)
    features = ['cast', 'keywords', 'genres']
    for feature in features:
        main_data[feature] = main_data[feature].apply(get_list)
    
    features = ['director', 'cast', 'keywords', 'genres']
    for feature in features:
        main_data[feature] = main_data[feature].apply(clean_data)    

    main_data["combination"] = main_data[['cast', 'keywords', 'genres', 'director']].apply(lambda x: ' '.join(x), axis = 1)

    features = ['director', 'cast', 'keywords', 'genres', 'combination']
    # print(main_data[features].head())
    main_data.to_csv('main_data.csv')
    return main_data

def create_similarity_matrix():
    main_data = create_main_dataset()
    count = CountVectorizer(stop_words='english')
    count_matrix = count.fit_transform(main_data['combination'])
    cosine_sim2 = cosine_similarity(count_matrix, count_matrix)
    # print(type(cosine_sim2))
    # print(cosine_sim2.shape)
    # main_data.to_csv('main_data.csv')
    np.save('cosine_similarity.npy', cosine_sim2)
    return cosine_sim2, main_data


def get_recommendations(m):
    cosine_similarity, main_data = create_similarity_matrix()
    if m not in main_data['lowercase_title'].unique():
        return('Sorry! The movie you requested is not in our database. Please check the spelling or try with some other movies')
    else:
        index = main_data.loc[main_data['lowercase_title']==m].index[0]
        similarity_list =  list(enumerate(cosine_similarity[index]))
        similarity_list = sorted(similarity_list, key = lambda x:x[1] ,reverse=True)
        similarity_list = similarity_list[0:11]
        top_titles = []
        for i in range(len(similarity_list)):
            a = similarity_list[i][0]
            top_titles.append(main_data['title'][a])
        # print(top_titles)
        return top_titles

# main_data = create_main_dataset()
print(get_recommendations('the dark knight rises'))

# credits['crew'] = credits['crew'].apply(literal_eval)
# print(credits['crew'][0])