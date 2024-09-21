import { v2 as cloudinary } from "npm:cloudinary";

export function uploadPromiseDenoCloudinary(file) {

  const folder_name = "incidents";
  const filename_prefix = `incidenttest_${Date.now()}`;


  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder_name,
        public_id: filename_prefix,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Convert the file content to a ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(file.content);
        controller.close();
      },
    });

    // Pipe the ReadableStream to the Cloudinary upload stream
    readableStream.pipeTo(new WritableStream({
      write(chunk) {
        uploadStream.write(chunk);
      },
      close() {
        uploadStream.end();
      },
    }));
  });

}
