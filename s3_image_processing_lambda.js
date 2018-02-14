
var AWS = require('aws-sdk');

var rekognition = new AWS.Rekognition({region: 'us-west-2'});

const phone_number = process.env.phone_number;
const EMAIL = process.env.email;

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });


exports.handler = (event, context, callback) => {
    // TODO implement
    console.log("new photo added: ", event);
    
    var params = {
      CollectionId: 'family', /* required */
      Image: { /* required */
        S3Object: {
          Bucket: 'graciafamilyphoto',
          Name: 'deepkat.jpg'
        }
      },
      FaceMatchThreshold: 95,
      MaxFaces: 5
    };
    rekognition.searchFacesByImage(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        console.log("rekognition response: ", data, " type: ", typeof data);           // successful response
        if (data.FaceMatches.length <= 0) {
          console.log("no face founded", EMAIL);           // successful response
          
          // publish message
          const snsPara = {
              Message: 'Non-family member in your home!, click link to see stranger image: https://s3-us-west-2.amazonaws.com/graciafamilyphoto/stranger.jpg',
              // Message: 'Stranger found in security lab N113 at location: Northtec campus, Building 1, N1_Meeting, Lab N113. Click link to see stranger image: https://s3-us-west-2.amazonaws.com/graciafamilyphoto/stranger.jpg',
              TopicArn: 'arn:aws:sns:us-west-2:515161752909:faceDetected'
              // Email: EMAIL
              // PhoneNumber: phone_number
              
          };
          
          SNS.publish(snsPara, callback);          
          
          
        } else {
          console.log("face founded, email", EMAIL);           // successful response
          
          // publish message
          const snsPara = {
              Message: 'Family member in your home!',
              TopicArn: 'arn:aws:sns:us-west-2:515161752909:faceDetected'
              // Email: EMAIL
              // PhoneNumber: phone_number
              
          };
          
          SNS.publish(snsPara, callback);          
                    
        }
      }
    });
    
    callback(null, 'Hello from Lambda');
};
