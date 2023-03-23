from masterConnection import DataAccessClient
from sklearn.neighbors import KNeighborsClassifier
import math


class KNeighborsClient(object):
    def __init__(self):
        self.zscore_path = '../SQLQueries/KNearestNeighbors/ZScoreNormalizedSample.sql'
        self.data = DataAccessClient()

    def get_zscore_data(self):
        zscore_data = self.data.execute_query(self.zscore_path)
        return zscore_data
    
    def get_predictions(self):
        data = self.get_zscore_data()
        n = data["N"]
        training_set_size = math.trunc(n * .8)
        k = math.trunc(data["K"])
        sample = data["SampleList"]
        labels = data["LabelList"]

        training_set = sample[:training_set_size]
        training_labels = labels[:training_set_size]

        test_set = sample[training_set_size:]
        classifier = KNeighborsClassifier(n_neighbors = k)
        classifier.fit(training_set, training_labels)

        predictions = classifier.predict(test_set)
        print(predictions)

machine = KNeighborsClient()
machine.get_predictions()

