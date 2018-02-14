
var AWS = require('aws-sdk');

var rekognition = new AWS.Rekognition({region: 'us-west-2'});

const phone_number = process.env.phone_number;
const EMAIL = process.env.email;

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

var cmxDomain = 'https://location-sandbox.cmxdemo.com';
var cmxEndpoint =  new AWS.Endpoint(cmxDomain);
var cmxPath = '/api/location/v1/clients/?tenantId=12&macAddress=40:9f:38:36:4d:5f';

function findDeeplensDeviceLocationWithCiscoCmx(callback) {
    var req = new AWS.HttpRequest(cmxEndpoint);

    req.method = 'GET';
    req.headers['Content-Type'] = 'application/json';
    req.headers['Authorization'] = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYnkiOiJMb2NhdGlvbiIsIml0byI6IkxvY2F0aW9uIiwidHlwZSI6ImFwcF9hY2Nlc3NfdG9rZW4iLCJpYXQiOjE1MTg1NDAwOTEsImV4cCI6MTUxODYyNjQ5MX0.uCVkjkrRgbMeqUoSeyrAr1OrUl0lUBLq_Cw4uwR_q1k'
    req.path = cmxPath;

    // Send request to ES
    var send = new AWS.NodeHttpClient();

    send.handleRequest(req, null, function(httpResp) {
        var body = '';
        httpResp.on('data', function (chunk) {
            body += chunk;
        });
        httpResp.on('end', function (chunk) {
            if ((body != null) || body.isEmpty()) {
                console.log('get body: ', body);
                var responseJson = JSON.parse(body);
                var location = responseJson.locationMapHierarchy;
                
                // publish message
                const snsPara = {
                    // Message: 'Non-family member in your home!, click link to see stranger image: https://s3-us-west-2.amazonaws.com/graciafamilyphoto/stranger.jpg',
                    // Message: 'Stranger found in security lab N113 at location: Northtec campus, Building 1, N1_Meeting, Lab N113. Click link to see stranger image: https://s3-us-west-2.amazonaws.com/graciafamilyphoto/stranger.jpg',
                    Message: 'Stranger found in security lab N113 at location: ' + location + ' Click link to see stranger image: https://s3-us-west-2.amazonaws.com/graciafamilyphoto/stranger.jpg',
                    TopicArn: 'arn:aws:sns:us-west-2:515161752909:faceDetected'
                    // Email: EMAIL
                    // PhoneNumber: phone_number
                    
                };
                
                SNS.publish(snsPara, callback);    
                
            } else {
                console.error('response no data');
                context.fail();
            }
        });
    }, function(err) {
        console.log('Error: ' + err);
        context.fail();
    });
}

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
          
          let location = findDeeplensDeviceLocationWithCiscoCmx(callback);
   
          
          
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
