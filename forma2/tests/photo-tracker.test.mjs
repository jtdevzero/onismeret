import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePhotoFile, photoDimensions, PHOTO_MAX_EDGE } from '../js/core/photo-tracker.js';

test('fotóimport csak ismert képtípusra és méretre érvényes',()=>{
  assert.equal(validatePhotoFile({type:'image/jpeg',size:1000}),null);
  assert.equal(validatePhotoFile({type:'image/webp',size:1000}),null);
  assert.equal(validatePhotoFile({type:'image/svg+xml',size:1000}),'type');
  assert.equal(validatePhotoFile({type:'image/jpeg',size:20e6}),'size');
  assert.equal(validatePhotoFile({type:'image/png',size:0}),'size');
  assert.equal(validatePhotoFile(null),'type');
});
test('képméretezés a képarányt megtartja, nem nagyít',()=>{
  assert.deepEqual(photoDimensions(3000,1500),[1280,640]);
  assert.deepEqual(photoDimensions(800,400),[800,400]);
  assert.deepEqual(photoDimensions(1000,2000),[640,1280]);
  assert.equal(photoDimensions(0,5),null);
  assert.equal(PHOTO_MAX_EDGE,1280);
});
