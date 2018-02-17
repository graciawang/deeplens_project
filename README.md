# deeplens_project

The motion notification from normal security camera such as Samsung is annoying. I don't want a notification when my pet or kids move around the house. I only want an alarm notification when a stranger come to my house, and I want to see the face of the stranger immediately without playback the video recording. 

In some scenario, stranger intrusion notification in real-time is not good enough. For example, the security guard needs the accurate location of the stranger to take immediate actions. Therefore the notification should have stranger's location information.

In this project, we send realtime SMS/email notification of stranger's location and photo using Deeplens and Cisco CMX WiFi location service (https://www.cisco.com/c/en/us/solutions/enterprise-networks/connected-mobile-experiences/index.html)

Below are the working flow we build the system:
1. Build lambda function to detect face object, send face image and Deeplens MAC address to S3
2. Deploy above lambda function and face detection model to Deeplens
3. Build lambda function to call Rekognition API to compare detected face with faces in collection named "family", check if it's a known face in the collection or not. If an unknown stranger face detected, publish message to SNS topic, which trigger an email notification. Setup this lambda function trigger by S3 new image upload event
4. Setup SNS topic for email message notification
5. To obtain location information of stranger, we imported testing map and location hierarchy into CMX account, placed APs in the map in CMX cloud service (https://location-test.cmxdemo.com/tm). In the meanwhile, we enhance lambda function in 3, to read MAC address from S3 file, and call CMX client API with MAC address as query parameter to obtain Deeplens device location

Actually, the use case we solved in this project can be generalized as below: an intelligent system to detect the event, capture the image of the event, send real-time notification with accurate location for immediate response. 

The next of our creation, we want to build a system to help seniors living alone. We want to use Sagemaker to train a deep learning model to detect person fall on the floor event and deploy this model to Deeplens -- to automatically detect elder person fall on floor or in coma state, and send real-time notification with accurate location of the fall event to urgent care team or relatives for fast reaction of rescue or assistant. 



1. Deploy Deeplens project with below lambda function and deeplens-face-detection model. 
greengrassInfraUpload_lambda.py

This lambda function achieves 3 tasks:

A. detect face object

B. send face image to S3

C. send Deeplens MAC address to S3



2. S3 image upload triggers below lambda function:
s3_image_processing_lambda.js

This lambda function achieves 3 tasks:

A. call Rekognition API to compare detected face with faces in collection named "family"

B. check if it's a known face in the collection or not

C. if an unknown stranger face detected, publish message to SNS topic, which trigger an email notification



3. Integration with Cisco WiFi location service to detect stranger S3 image upload triggers below lambda function:
s3_image_processing_cisco_cmx_location_lambda.js

Besides 2, this lambda function achieves additional tasks:

A. read MAC address from S3 file

B. call CMX client API with MAC address as query parameter to obtain Deeplens device locatio

C. send email notification with the location information
