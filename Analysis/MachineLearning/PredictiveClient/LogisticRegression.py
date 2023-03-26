from masterConnection import DataAccessClient
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

class LogisticRegressionClient(object):
    def __init__(self) -> None:
        self.logistic_path = '../SQLQueries/LogisticRegression/LogisticSample.sql'
        self.data = DataAccessClient()

    def get_logistic_sample_data(self):
        log_data = self.data.execute_query(self.logistic_path)
        return log_data

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

    def perform_regression(self):
        data = self.get_logistic_sample_data()
        data = self.model_standardization(data)
        regression = LogisticRegression()
        regression.fit(data["TrainingSample"], data["TrainingLabel"])
        prediction_probability =regression.predict_proba(data["TestSample"]) #each array is probability of a win followed by probability of a loss for each election.
        prediction = regression.predict(data["TestSample"])
        quality = self.data.check_correctness(data["TestLabel"],prediction )

        return {"PredictionProbability":prediction_probability, "Prediction":prediction, "Quality": quality}

log_reg = LogisticRegressionClient()


print(log_reg.perform_regression())