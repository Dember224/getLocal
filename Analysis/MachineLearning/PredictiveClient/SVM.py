from masterConnection import DataAccessClient
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler


class SupportVectorClient(object):
    def __init__(self) -> None:
        self.data = DataAccessClient()
        self.svm_path = '../SQLQueries/SVM/SVMSample.sql' #For right now this is identical to the logistic regression sample. I kept them separate so that one can be changed without changing the other model.
    
    def get_svm_sample_data(self):
        svm_data = self.data.execute_query(self.svm_path)
        return svm_data

    def perform_regression(self):
        data = self.get_svm_sample_data()
        data = self.data.model_standardization(data)

        classifier = SVC(gamma = 0.5, C = 1.0)
        classifier.fit(data['TrainingSample'], data['TrainingLabel'])
        print(classifier.score(data['TestSample'], data['TestLabel']))
        predictions = classifier.predict(data['TestSample'])

        quality = self.data.check_correctness(data['TestLabel'], predictions)
        print(quality)



svm = SupportVectorClient()
svm.perform_regression()
    

    
