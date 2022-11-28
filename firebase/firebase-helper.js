const admin = require('firebase-admin');
const serviceAccountKey = './firebase/eslab-69708.json';

const bucketName = 'eslab-69708.appspot.com'
const srcFilename = 'db.json'
//initialize the app
admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey),
	storageBucket: bucketName //you can find in storage.
});

//get your bucket
var bucket = admin.storage().bucket();

//function to upload file
async function uploadFile(filepath, filename) {
	await bucket.upload(filepath, {
		destination: filename,
		metadata: {
			cacheControl: 'public, max-age=31536000'
		}
	});

	console.log(`${filename} uploaded to bucket.`);
}

async function generateSignedUrl(filename) {
	const options = {
		version: 'v2',
		action: 'read',
		expires: Date.now() + 1000 * 60 * 60
	};

	const [url] = await bucket.file(filename).getSignedUrl(options);
	console.log(url);
};

async function downloadFile() {
    const options = {
      // The path to which the file should be downloaded, e.g. "./file.txt"
      destination: 'db.json',
    };

    // Downloads the file
    await admin.storage().bucket(bucketName).file(srcFilename).download(options);

    console.log(`gs://${bucketName}/${srcFilename} downloaded to ${'db.json'}.`);
}

module.exports =  {uploadFile,downloadFile}