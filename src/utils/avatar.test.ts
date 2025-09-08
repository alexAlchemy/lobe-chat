import { describe, expect, it } from 'vitest';

import { isImageUrl, isEmoji, getAvatarType } from '../avatar';

describe('Avatar Utilities', () => {
  describe('isImageUrl', () => {
    it('should return true for HTTP URLs', () => {
      expect(isImageUrl('http://example.com/image.jpg')).toBe(true);
      expect(isImageUrl('https://example.com/image.png')).toBe(true);
    });

    it('should return true for data URIs', () => {
      expect(isImageUrl('data:image/png;base64,iVBORw0KGgo...')).toBe(true);
    });

    it('should return true for relative paths', () => {
      expect(isImageUrl('/uploads/avatar.jpg')).toBe(true);
      expect(isImageUrl('./images/avatar.png')).toBe(true);
      expect(isImageUrl('../assets/avatar.gif')).toBe(true);
    });

    it('should return true for client-s3 URLs', () => {
      expect(isImageUrl('client-s3://hash123')).toBe(true);
    });

    it('should return true for file extensions', () => {
      expect(isImageUrl('avatar.jpg')).toBe(true);
      expect(isImageUrl('image.png')).toBe(true);
    });

    it('should return false for non-URL strings', () => {
      expect(isImageUrl('🤖')).toBe(false);
      expect(isImageUrl('text')).toBe(false);
      expect(isImageUrl('')).toBe(false);
    });
  });

  describe('isEmoji', () => {
    it('should return true for single emojis', () => {
      expect(isEmoji('🤖')).toBe(true);
      expect(isEmoji('👍')).toBe(true);
      expect(isEmoji('🎉')).toBe(true);
    });

    it('should return false for URLs', () => {
      expect(isEmoji('https://example.com/image.jpg')).toBe(false);
      expect(isEmoji('/path/to/image.png')).toBe(false);
    });

    it('should return false for multi-character strings', () => {
      expect(isEmoji('text')).toBe(false);
      expect(isEmoji('')).toBe(false);
    });
  });

  describe('getAvatarType', () => {
    it('should return "emoji" for emoji strings', () => {
      expect(getAvatarType('🤖')).toBe('emoji');
      expect(getAvatarType('👍')).toBe('emoji');
    });

    it('should return "image" for image URLs', () => {
      expect(getAvatarType('https://example.com/avatar.png')).toBe('image');
      expect(getAvatarType('/uploads/avatar.jpg')).toBe('image');
      expect(getAvatarType('data:image/png;base64,iVBORw0KGgo...')).toBe('image');
      expect(getAvatarType('client-s3://hash123')).toBe('image');
    });

    it('should return "unknown" for other strings', () => {
      expect(getAvatarType('text')).toBe('unknown');
      expect(getAvatarType('')).toBe('unknown');
    });
  });
});