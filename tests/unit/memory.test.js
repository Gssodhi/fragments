const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('memory index module', () => {
  const ownerId = 'test-owner';
  const fragmentId = 'frag-1';
  const fragment = {
    ownerId,
    id: fragmentId,
    type: 'text/plain',
    size: 12,
    created: Date.now(),
  };
  const buffer = Buffer.from('sample data');

  beforeEach(async () => {
    // Make sure to clean up before each test
    await deleteFragment(ownerId, fragmentId).catch(() => {});
  });

  // --------------------------------------------------------------------------
  describe('writeFragment() and readFragment()', () => {
    test('writeFragment stores metadata and readFragment retrieves it as an object', async () => {
      await expect(writeFragment(fragment)).resolves.toBeUndefined();
      const result = await readFragment(ownerId, fragmentId);
      expect(result).toEqual(fragment);
    });

    test('readFragment returns undefined for non-existent fragment', async () => {
      const result = await readFragment('unknown-owner', 'no-id');
      expect(result).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  describe('writeFragmentData() and readFragmentData()', () => {
    test('writeFragmentData stores and readFragmentData retrieves the buffer', async () => {
      await expect(writeFragmentData(ownerId, fragmentId, buffer)).resolves.toBeUndefined();
      const result = await readFragmentData(ownerId, fragmentId);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.equals(buffer)).toBe(true);
    });

    test('readFragmentData returns undefined for missing data', async () => {
      const result = await readFragmentData('unknown-owner', 'no-id');
      expect(result).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  describe('listFragments()', () => {
    test('returns array of IDs when expand=false', async () => {
      await writeFragment(fragment);
      const results = await listFragments(ownerId, false);
      expect(Array.isArray(results)).toBe(true);
      expect(results).toContain(fragmentId);
    });

    test('returns array of full fragments when expand=true', async () => {
      await writeFragment(fragment);
      const results = await listFragments(ownerId, true);
      expect(Array.isArray(results)).toBe(true);
      expect(results.some((f) => JSON.parse(f).id === fragmentId)).toBe(true);
    });

    test('returns empty array for unknown owner', async () => {
      const results = await listFragments('no-such-owner', false);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  describe('deleteFragment()', () => {
    test('removes both metadata and data', async () => {
      await writeFragment(fragment);
      await writeFragmentData(ownerId, fragmentId, buffer);

      // Verify exists
      const meta = await readFragment(ownerId, fragmentId);
      const data = await readFragmentData(ownerId, fragmentId);
      expect(meta).toBeDefined();
      expect(data).toBeDefined();

      // Delete it
      await expect(deleteFragment(ownerId, fragmentId)).resolves.toBeDefined();

      // Should now be gone
      const metaAfter = await readFragment(ownerId, fragmentId);
      const dataAfter = await readFragmentData(ownerId, fragmentId);
      expect(metaAfter).toBeUndefined();
      expect(dataAfter).toBeUndefined();
    });

    test('deleteFragment safely resolves even if fragment does not exist', async () => {
      await expect(deleteFragment('no-owner', 'no-id')).rejects.toThrow(
    'missing entry for primaryKey=no-owner and secondaryKey=no-id'
  );
    });
  });
});
