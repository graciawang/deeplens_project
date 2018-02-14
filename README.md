# deeplens_project

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
