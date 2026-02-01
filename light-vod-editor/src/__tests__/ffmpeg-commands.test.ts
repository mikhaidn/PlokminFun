import { describe, it, expect } from 'vitest';
import { generateConcatCommand, generateSplitCommands } from '../utils/ffmpeg-commands';

describe('FFmpeg Command Generation', () => {
  describe('concat (merge segments)', () => {
    it('single segment uses fast stream copy (no re-encoding)', () => {
      const cmd = generateConcatCommand('video.mp4', [{ start: 10, end: 20 }]);

      // Single segment should use -c copy optimization
      expect(cmd).toContain('ffmpeg -ss 00:00:10.00 -t 10.00');
      expect(cmd).toContain('-c copy');
      expect(cmd).toContain('video.mp4'); // No _merged suffix for single segment
      expect(cmd).not.toContain('filter_complex'); // Should NOT use filter_complex
      expect(cmd).not.toContain('trim='); // Should NOT use trim filter
    });

    it('merges multiple segments', () => {
      const cmd = generateConcatCommand('video.mp4', [
        { start: 10, end: 20 },
        { start: 30, end: 45 },
      ]);

      expect(cmd).toContain('trim=start=10.00:end=20.00');
      expect(cmd).toContain('trim=start=30.00:end=45.00');
      expect(cmd).toContain('concat=n=2:v=1:a=1');
    });

    it('preserves file extension', () => {
      expect(generateConcatCommand('video.mkv', [{ start: 0, end: 10 }])).toContain('.mkv');
      expect(generateConcatCommand('video.webm', [{ start: 0, end: 10 }])).toContain('.webm');
    });

    it('throws on empty segments', () => {
      expect(() => generateConcatCommand('video.mp4', [])).toThrow('no segments');
    });
  });

  describe('split (separate files)', () => {
    it('splits single segment', () => {
      const cmds = generateSplitCommands('video.mp4', [{ start: 10, end: 20 }]);

      expect(cmds).toHaveLength(1);
      expect(cmds[0]).toContain('ffmpeg -ss 00:00:10.00 -t 10.00');
      expect(cmds[0]).toContain('-c copy');
      expect(cmds[0]).toContain('video_segment1.mp4');
    });

    it('splits multiple segments', () => {
      const cmds = generateSplitCommands('video.mp4', [
        { start: 10, end: 20 },
        { start: 30, end: 50 },
      ]);

      expect(cmds).toHaveLength(2);
      expect(cmds[0]).toContain('-ss 00:00:10.00 -t 10.00');
      expect(cmds[1]).toContain('-ss 00:00:30.00 -t 20.00');
    });

    it('throws on empty segments', () => {
      expect(() => generateSplitCommands('video.mp4', [])).toThrow('no segments');
    });
  });
});
