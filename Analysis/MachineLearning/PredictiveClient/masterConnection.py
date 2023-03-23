import psycopg2
import os

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
            "labelList":label_list,
            "CampaignList": campaign_list
        }
        return return_dict
    def execute_query(self, query_path):
        query = self.return_query_text(query_path=query_path)
        results = self.standardize_results(data_list=self.execute(query))
        return results


client = DataAccessClient()

print(client.execute_query('../SQLQueries/KNearestNeighbors/ZScoreNormalizedSample.sql'))