import psycopg2
import os
import math
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

DATABASE = os.environ['DATABASE']
USER = os.environ['PG_USER']
PASSWORD = os.environ['PG_PASSWORD']
URL = os.environ['PG_URL']
PORT = os.environ['PG_PORT']

class DataAccessClient(object):

    def __init__(self):
        self.connection = psycopg2.connect(database=DATABASE, user=USER, password=PASSWORD, host=URL, port=PORT)

    def cursor(self):
        return self.connection.cursor()

    def close_connection(self):
        return self.connection.close()

    def return_query_text(self, query_path):
        fd = open(query_path, 'r')
        sqlFile = fd.read()
        fd.close()
        return sqlFile
        
    def execute(self, query):
        cursor = self.cursor()
        cursor.execute(query)
        results = cursor.fetchall()
        self.close_connection()
        return results
        
    def standardize_results(self,data_list):
        sample_list = []
        label_list = []
        campaign_list = []
        for tuple in data_list:
            as_list = list(tuple)
            sample = as_list[2:]
            labels = as_list[1]
            campaign = as_list[0]
            sample_list.append(sample)
            label_list.append(labels)
            campaign_list.append(campaign)

        return_dict = {
            "SampleList": sample_list,
            "LabelList":label_list,
            "CampaignList": campaign_list,
            "N": len(sample_list),
            "K":math.sqrt(len(sample_list))
        }
        return return_dict
    def execute_query(self, query_path):
        query = self.return_query_text(query_path=query_path)
        results = self.standardize_results(data_list=self.execute(query))
        return results

    def check_correctness(self,labels, guesses):
        return_dict =  {
            "Accuracy":accuracy_score(labels, guesses),
            "Recall": recall_score(labels, guesses),
            "Precision": precision_score(labels, guesses),
            "F1":f1_score(labels, guesses)
        }
        return return_dict

    def model_standardization(self, data):
        scaler = StandardScaler()
        sample = data["SampleList"]
        labels = data["LabelList"]
        scaler.fit(sample)
        sample = scaler.transform(sample)
        training_sample, test_sample, training_label, test_label = train_test_split(sample, labels, test_size=0.75)
        data["TrainingSample"] = training_sample
        data["TestSample"] = test_sample
        data["TrainingLabel"] = training_label
        data["TestLabel"] = test_label
        return data


# client = DataAccessClient()

# print(client.execute_query('../SQLQueries/KNearestNeighbors/ZScoreNormalizedSample.sql'))