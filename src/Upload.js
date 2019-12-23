import '@reshuffle/code-transform/macro';
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import ReactCrop from 'react-image-crop';
import { useFileUpload } from '@reshuffle/react-storage';
import 'react-image-crop/dist/ReactCrop.css';
import './Upload.css';
import { setProfilePic } from '../backend/users';

function getCroppedImg(image, crop, { width, height }) {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const scaleRatio = Math.max(scaleX, scaleY);
  const edgeX = (scaleRatio * image.width - image.naturalWidth) / 2;
  const edgeY = (scaleRatio * image.height - image.naturalHeight) / 2;
  const scaledCropX = crop.x * scaleRatio;
  const scaledCropY = crop.y * scaleRatio;
  const scaledWidth = crop.width * scaleRatio;
  const scaledHeight = crop.height * scaleRatio;
  const scaledEndX = scaledCropX + scaledWidth;
  const scaledEndY = scaledCropY + scaledHeight;

  const offsetX = Math.min(Math.max(scaledCropX - edgeX, 0), image.naturalWidth);
  const cropEndX = Math.min(Math.max(scaledEndX - edgeX, 0), image.naturalWidth);

  const offsetY = Math.min(Math.max(scaledCropY - edgeY, 0), image.naturalHeight);
  const cropEndY = Math.min(Math.max(scaledEndY - edgeY, 0), image.naturalHeight);

  const cropWidthOnImage = cropEndX - offsetX;
  const targetWidth = cropWidthOnImage / scaledWidth * width;
  const targetOffsetX = scaledEndX >= image.naturalWidth + edgeX ? 0 : width - targetWidth;
  const cropHeightOnImage = cropEndY - offsetY;
  const targetHeight = cropHeightOnImage / scaledHeight * height;
  const targetOffsetY = scaledEndY >= image.naturalHeight + edgeY ? 0 : height - targetHeight;

  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    offsetX,
    offsetY,
    cropWidthOnImage,
    cropHeightOnImage,
    targetOffsetX,
    targetOffsetY,
    targetWidth,
    targetHeight,
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

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop: onSelectFile,
    multiple: false,
    accept: 'image/*',
  });

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
    <div className='upload'>
      {status === 'error' && <h3>Upload failed</h3>}
      {src ? (
        <>
          <div className='actions'>
            <input type='button' disabled={!blob || status === 'uploading'} onClick={uploadImage} value='Upload' />
            <input type='button' onClick={() => setSrc()} value='Clear' />
          </div>
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
        </>
      ) : (
        <div className={clsx('dropzone', isDragActive && 'active', isDragAccept && 'accept', isDragReject && 'reject')} {...getRootProps()}>
          <input {...getInputProps()} />
          {
            src
              ? null
              : isDragReject
                ? <h2>Please upload only 1 image file</h2>
                : isDragActive
                  ? <h2>Drop the files here ...</h2>
                  : <h2>Drag 'n' drop some files here, or click to select files</h2>
          }
        </div>
    )}
    </div>
  );
};
