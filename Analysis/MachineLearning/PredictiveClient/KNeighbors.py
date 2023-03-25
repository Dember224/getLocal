from masterConnection import DataAccessClient
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score
import math


class KNeighborsClient(object):
    def __init__(self):
        self.zscore_path = '../SQLQueries/KNearestNeighbors/ZScoreNormalizedSample.sql'
        self.zscore_race_blind = '../SQLQueries/KNearestNeighbors/ZScoreRaceBlindSample.sql'
        self.zscore_gender_blind = '../SQLQueries/KNearestNeighbors/ZScoreGenderBlindSample.sql'
        self.zscore_demographic_blind ='../SQLQueries/KNearestNeighbors/ZScoreNonDemographicSample.sql'
        self.data = DataAccessClient()

    def get_zscore_general_data(self):
        zscore_data = self.data.execute_query(self.zscore_path)
        return zscore_data

    def get_zscore_race_blind_data(self):
        zscore_data = self.data.execute_query(self.zscore_race_blind)
        return zscore_data

    def get_zscore_gender_blind_data(self):
        zscore_data = self.data.execute_query(self.zscore_gender_blind)
        return zscore_data

    def get_zscore_demographic_blind_data(self):
        zscore_data = self.data.execute_query(self.zscore_demographic_blind)
        return zscore_data

    def check_correctness(self,labels, guesses):
        return_dict =  {
            "Accuracy":accuracy_score(labels, guesses),
            "Recall": recall_score(labels, guesses),
            "Precision": precision_score(labels, guesses),
            "F1":f1_score(labels, guesses)
        }
        return return_dict

    def coupler(self, predictions, campaigns):
        coupled_dict = {}
        for i in range(len(campaigns)):
            outcome = None
            if predictions[i] == 0:
                outcome = 'W'
            else:
                outcome = 'L'
            coupled_dict[campaigns[i]] = outcome

        return coupled_dict
    
    def get_general_sample_predictions(self, data,predict_this_list=None, predicted_campaign_id_list=None):
        n = data["N"]
        training_set_size = math.trunc(n * .8)
        k = math.trunc(data["K"])
        sample = data["SampleList"]
        labels = data["LabelList"]
        campaigns = data["CampaignList"]

        training_set = sample[:training_set_size]
        training_labels = labels[:training_set_size]

        test_labels= labels[training_set_size:]
        test_campaigns = None

        test_set = sample[training_set_size:]
        classifier = KNeighborsClassifier(n_neighbors = k)
        classifier.fit(training_set, training_labels)
        predictions = None

        if predict_this_list:
            predictions = classifier.predict(predict_this_list)
            test_campaigns = predicted_campaign_id_list
        else:
            predictions = classifier.predict(test_set)
            test_campaigns = campaigns[training_set_size:]

        result_dict = {
            "Predictions": predictions,
            "Campaigns": test_campaigns,
            "Coupled": self.coupler(predictions, test_campaigns),
            "Quality": self.check_correctness(test_labels,predictions)
        }
        return result_dict

    def get_general_prediction(self):
        data = self.get_zscore_general_data()
        return self.get_general_sample_predictions(data)

    def get_race_blind_prediction(self):
        data = self.get_zscore_race_blind_data()
        return self.get_general_sample_predictions(data)

    def get_gender_blind_prediction(self):
        data = self.get_zscore_gender_blind_data()
        return self.get_general_sample_predictions(data)

    def get_demographic_blind_prediction(self):
        data = self.get_zscore_demographic_blind_data()
        return self.get_general_sample_predictions(data)


machine = KNeighborsClient()
print(machine.get_gender_blind_prediction())

# Gender blind sample works the best so far!!!
