function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload successful:', data);
        uploadResult.innerHTML = `
            <p>Upload successful!</p>
            <img src="${data.secure_url}" alt="Uploaded image" style="max-width: 300px;" />
        `;
    })
    .catch(error => {
        console.error('Error:', error);
        uploadResult.innerHTML = '<p>Upload failed. Please try again.</p>';
    });
}