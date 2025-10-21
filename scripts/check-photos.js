const { MatchResult } = require('../src/models');

async function checkPhotos() {
  const result = await MatchResult.findOne({
    where: { matchId: 'b320830d-eddb-450a-83cb-2b7cbf8bc193' }
  });

  console.log('Photos:', result.photos);
  console.log('Type:', typeof result.photos);
  console.log('Array?:', Array.isArray(result.photos));
  console.log('Length:', result.photos ? result.photos.length : 'null');

  process.exit(0);
}

checkPhotos();
