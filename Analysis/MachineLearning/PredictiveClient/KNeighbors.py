from masterConnection import DataAccessClient
from sklearn.neighbors import KNeighborsClassifier


class KNeighborsClient(object):
    def __init__(self):
        self.zscore_path = '../SQLQueries/KNearestNeighbors/ZScoreNormalizedSample.sql'
        self.data = DataAccessClient()

    def get_zscore_data(self):
        zscore_data = self.data.execute_query(self.zscore_path)