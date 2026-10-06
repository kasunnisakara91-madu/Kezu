/**
 * CRIMINAL SONG - Audius Engine
 *
 * Uses the official Audius API.
 *
 * .env:
 * AUDIUS_API_KEY=your_key
 * AUDIUS_BEARER_TOKEN=your_token
 */

const API_BASE =
  process.env.AUDIUS_API_URL ||
  'https://api.audius.co/v1';

const API_KEY =
  process.env.AUDIUS_API_KEY || '';

const BEARER_TOKEN =
  process.env.AUDIUS_BEARER_TOKEN || '';

function headers() {
  const h = {
    Accept: 'application/json',
    'User-Agent': 'CRIMINAL-SONG/1.0'
  };

  if (API_KEY) {
    h['X-API-Key'] = API_KEY;
  }

  if (BEARER_TOKEN) {
    h.Authorization = `Bearer ${BEARER_TOKEN}`;
  }

  return h;
}

async function request(endpoint) {
  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      method: 'GET',
      headers: headers()
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Audius returned invalid JSON (HTTP ${response.status})`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Audius API error ${response.status}: ${
        data?.message || text
      }`
    );
  }

  return data;
}

function durationFormat(seconds) {
  seconds = Number(seconds || 0);

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${secs
    .toString()
    .padStart(2, '0')}`;
}

function artwork(track) {
  if (!track?.artwork) return '';

  if (typeof track.artwork === 'string') {
    return track.artwork;
  }

  return (
    track.artwork['1000x1000'] ||
    track.artwork['480x480'] ||
    track.artwork['150x150'] ||
    ''
  );
}

function artist(track) {
  return (
    track?.user?.name ||
    track?.user?.handle ||
    'Unknown Artist'
  );
}

function streamUrl(id) {
  return `${API_BASE}/tracks/${encodeURIComponent(id)}/stream`;
}

function downloadUrl(id) {
  return `${API_BASE}/tracks/${encodeURIComponent(id)}/download`;
}

function normalize(track) {
  const id = String(track.id);

  const duration =
    Number(track.duration || 0);

  const cover =
    artwork(track);

  const downloadable =
    Boolean(
      track.downloadable ||
      track.is_downloadable ||
      track.has_downloads
    );

  return {
    id,

    title:
      track.title ||
      'Unknown Title',

    artist:
      artist(track),

    album:
      track.album_name ||
      track.playlist_name ||
      'Single',

    duration,

    durationFormatted:
      durationFormat(duration),

    releaseDate:
      track.release_date ||
      track.created_at ||
      'Unknown',

    thumbnail:
      cover,

    highResArtwork:
      cover,

    genre:
      track.genre ||
      'Music',

    previewUrl:
      streamUrl(id),

    streamUrl:
      streamUrl(id),

    downloadUrl:
      downloadable
        ? downloadUrl(id)
        : '',

    source:
      'Audius',

    downloadable,

    permalink:
      track.permalink || ''
  };
}

/**
 * Search Audius tracks
 */
export async function searchSongs(query) {
  if (!query?.trim()) {
    throw new Error(
      'Query parameter "q" is required'
    );
  }

  const q =
    encodeURIComponent(query.trim());

  const data = await request(
    `/tracks/search?query=${q}&limit=15&sort_method=relevant`
  );

  const tracks =
    Array.isArray(data.data)
      ? data.data
      : [];

  return tracks
    .filter(t => t?.id)
    .map(normalize);
}

/**
 * Search only tracks that Audius
 * marks as downloadable.
 */
export async function searchDownloadableSongs(query) {
  if (!query?.trim()) {
    throw new Error(
      'Query parameter "q" is required'
    );
  }

  const q =
    encodeURIComponent(query.trim());

  const data = await request(
    `/tracks/search?query=${q}` +
    `&limit=15` +
    `&sort_method=relevant` +
    `&only_downloadable=true`
  );

  const tracks =
    Array.isArray(data.data)
      ? data.data
      : [];

  return tracks
    .filter(t => t?.id)
    .map(normalize);
}

/**
 * Get a track by Audius ID,
 * or search by title/artist.
 */
export async function getSongDetails(queryOrId) {
  if (!queryOrId?.trim()) {
    throw new Error(
      'Song ID or query "q" is required'
    );
  }

  const target =
    queryOrId.trim();

  // Try direct ID first.
  try {
    const data = await request(
      `/tracks/${encodeURIComponent(target)}`
    );

    if (data?.data) {
      const song =
        normalize(data.data);

      return {
        ...song,

        bitrate:
          'Audius',

        format:
          'MP3',

        explicit:
          Boolean(
            data.data.is_explicit ||
            data.data.explicit
          ),

        copyright:
          data.data.copyright ||
          'Copyright belongs to the respective rights holder.'
      };
    }
  } catch {
    // Not an ID; search below.
  }

  const results =
    await searchSongs(target);

  if (!results.length) {
    throw new Error(
      `No Audius song found for "${target}"`
    );
  }

  return {
    ...results[0],

    bitrate:
      'Audius',

    format:
      'MP3',

    explicit:
      false,

    copyright:
      'Copyright belongs to the respective rights holder.'
  };
}

/**
 * Return stream/download information.
 */
export async function getDownloadInfo(queryOrId) {
  const song =
    await getSongDetails(queryOrId);

  if (!song.downloadable) {
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,

      downloadUrl: '',

      streamUrl:
        song.streamUrl,

      format:
        'MP3',

      quality:
        'Audius stream',

      estimatedSize:
        'Unknown',

      directDownload:
        false,

      expiresIn:
        'Not specified',

      message:
        'This Audius track is not marked as downloadable.'
    };
  }

  return {
    id: song.id,

    title: song.title,

    artist: song.artist,

    downloadUrl:
      downloadUrl(song.id),

    streamUrl:
      streamUrl(song.id),

    format:
      'MP3',

    quality:
      'Audius downloadable track',

    estimatedSize:
      'Unknown',

    directDownload:
      true,

    expiresIn:
      'Not specified'
  };
}

/**
 * Get stream URL.
 */
export async function getStreamUrl(queryOrId) {
  const song =
    await getSongDetails(queryOrId);

  return {
    id: song.id,

    title: song.title,

    artist: song.artist,

    streamUrl:
      streamUrl(song.id),

    format:
      'MP3',

    source:
      'Audius'
  };
}

/**
 * API health check.
 */
export async function healthCheck() {
  try {
    await request(
      '/tracks/trending?limit=1'
    );

    return {
      success: true,
      provider: 'Audius',
      online: true
    };
  } catch (error) {
    return {
      success: false,
      provider: 'Audius',
      online: false,
      error: error.message
    };
  }
}
