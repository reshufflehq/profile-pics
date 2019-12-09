import '@reshuffle/code-transform/macro';
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useFileUpload } from '@reshuffle/react-storage';
import { setProfilePic } from '../backend/users';

function getCroppedImg(image, crop, { width, height }) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  console.log(crop);

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    width,
    height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
      canvas.remove();
    }, 'image/jpeg');
  });
}

const imageSize = { width: 40, height: 40 };

export default ({ setDisplayProfilePic }) => {
  const [src, setSrc] = useState();
  const [imageRef, setImageRef] = useState();
  const [blob, setBlob] = useState();
  const [submittedToken, setSubmittedToken] = useState();
  const { startUpload, uploads, status } = useFileUpload();
  const [crop, setCrop] = useState({
    unit: '%',
    width: 30,
    aspect: 1,
  });

  const onSelectFile = useCallback((files) => {
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(files[0]);
    }
  }, [setSrc]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onSelectFile, multiple: false });

  useLayoutEffect(() => {
    (async () => {
      if (imageRef && crop.width && crop.height) {
        const blob = await getCroppedImg(imageRef, crop, imageSize);
        blob.name = `profile-${parseInt(Math.random() * 10000)}.jpg`;
        setBlob(blob);
      }
    })();
  }, [imageRef, crop, setBlob]);

  const uploadImage = useCallback(() => startUpload([blob]), [startUpload, blob]);
  useEffect(() => {
    (async () => {
      if (status === 'complete' && submittedToken !== uploads[0].token) {
        setSubmittedToken(uploads[0].token);
        const { picture } = await setProfilePic(uploads[0].token);
        setDisplayProfilePic(picture.url);
      }
    })();
  }, [status, uploads, setDisplayProfilePic, submittedToken]);

  return (
    <>
      {status === 'error' && <h3>Upload failed</h3>}
      {src ? (
        <>
          <ReactCrop
            src={src}
            crop={crop}
            ruleOfThirds
            minWidth={imageSize.width}
            minHeight={imageSize.height}
            onImageLoaded={setImageRef}
            onChange={setCrop}
            onComplete={setCrop}
          />
          <input type='button' disabled={!blob || status === 'uploading'} onClick={uploadImage} value='Upload' />
          <input type='button' onClick={() => setSrc()} value='Clear' />
        </>
      ) : (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            src
              ? null
              : isDragActive
                ? <p>Drop the files here ...</p>
                : <p>Drag 'n' drop some files here, or click to select files</p>
          }
        </div>
    )}
    </>
  );
};
