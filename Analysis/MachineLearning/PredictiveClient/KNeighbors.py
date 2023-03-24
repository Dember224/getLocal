from masterConnection import DataAccessClient
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score
import math


class KNeighborsClient(object):
    def __init__(self):
        self.zscore_path = '../SQLQueries/KNearestNeighbors/ZScoreNormalizedSample.sql'
        self.data = DataAccessClient()

    def get_zscore_data(self):
        zscore_data = self.data.execute_query(self.zscore_path)
        return zscore_data

    def check_correctness(self,labels, guesses):
        return_dict =  {
            "Accuracy":accuracy_score(labels, guesses),
            "Recall": recall_score(labels, guesses),
            "Precision": precision_score(labels, guesses),
            "F1":f1_score(labels, guesses)
        }
        return return_dict
    
    def get_general_sample_predictions(self):
        data = self.get_zscore_data()
        n = data["N"]
        training_set_size = math.trunc(n * .8)
        k = math.trunc(data["K"])
        sample = data["SampleList"]
        labels = data["LabelList"]

        training_set = sample[:training_set_size]
        training_labels = labels[:training_set_size]

        test_labels= labels[training_set_size:]

        test_set = sample[training_set_size:]
        classifier = KNeighborsClassifier(n_neighbors = k)
        classifier.fit(training_set, training_labels)

        predictions = classifier.predict(test_set)
        print(predictions)
        print(self.check_correctness(test_labels,predictions))

machine = KNeighborsClient()
machine.get_general_sample_predictions()

