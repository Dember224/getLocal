import psycopg2
import os

DATABASE = os.environ['DATABASE']
USER = os.environ['PG_USER']
PASSWORD = os.environ['PG_PASSWORD']
URL = os.environ['PG_URL']
PORT = os.environ['PG_PORT']

class DataAccessClient(object):

    def __init__(self):
        self.connection = psycopg2.connect(database=DATABASE, user=USER, password=PASSWORD, host=PORT)

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

    def execute_query(self, query_path):
        query = self.return_query_text(query_path=query_path)
        return self.execute(query)


