import '@reshuffle/code-transform/macro';
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import ReactCrop from 'react-image-crop';
import { useFileUpload } from '@reshuffle/react-storage';
import 'react-image-crop/dist/ReactCrop.css';
import './Upload.css';
import { setProfilePic } from '../backend/users';

/**
 * Calculate margin (m) between container (C) and centered object (O)
 *
 * CCCCCCCCCCCC
 * mmmmOOOOmmmm
 */
function calcMargin(containerLength, objectLength) {
  return (containerLength - objectLength) / 2;
}

/**
 * Calculate object (O) crop (X) without given margin (m) => (D)
 *
 * mmmmOOOOmmmm
 *   XXXX
 *     DD
 */
function dropMargin(objectLength, margin, cropStart, cropSize) {
  const cropEnd = cropSize + cropStart;

  const cropStartWithoutMargin = Math.min(Math.max(cropStart - margin, 0), objectLength);
  const cropEndWithoutMargin = Math.min(Math.max(cropEnd - margin, 0), objectLength);
  const cropSizeWithoutMargin = cropEndWithoutMargin - cropStartWithoutMargin;

  return {
    start: cropStartWithoutMargin,
    size: cropSizeWithoutMargin,
  };
}

function getCroppedImg(image, crop, resizeTo) {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const scaleRatio = Math.max(scaleX, scaleY);
  const cropWidth = crop.width * scaleRatio;
  const cropHeight = crop.height * scaleRatio;

  const marginX = calcMargin(image.width * scaleRatio, image.naturalWidth);
  const cropX = dropMargin(image.naturalWidth, marginX, crop.x * scaleRatio, cropWidth);
  const marginY = calcMargin(image.height * scaleRatio, image.naturalHeight);
  const cropY = dropMargin(image.naturalHeight, marginY, crop.y * scaleRatio, cropHeight);

  const resizedWidth = cropX.size / cropWidth * resizeTo.width;
  const resizedOffsetX = cropX.start < marginX ? resizeTo.width - resizedWidth : 0;
  const resizedHeight = cropY.size / cropHeight * resizeTo.height;
  const resizedOffsetY = cropY.start < marginY ? resizeTo.height - resizedHeight : 0;

  const canvas = document.createElement('canvas');

  canvas.width = resizeTo.width;
  canvas.height = resizeTo.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    cropX.start,
    cropY.start,
    cropX.size,
    cropY.size,
    resizedOffsetX,
    resizedOffsetY,
    resizedWidth,
    resizedHeight,
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

const resizedImageSize = { width: 40, height: 40 };

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
        const blob = await getCroppedImg(imageRef, crop, resizedImageSize);
        // Generate a unique name to reset useFileUpload state
        blob.name = `profile-${parseInt(Math.random() * 1000000)}.jpg`;
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
            minWidth={resizedImageSize.width}
            minHeight={resizedImageSize.height}
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
