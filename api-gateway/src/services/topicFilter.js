const STOP_WORDS = new Set([
  'the', 'is', 'a', 'an', 'and', 'or', 'but', 'more', 'here', 'this', 'that', 'with',
  'from', 'about', 'have', 'has', 'had', 'was', 'were', 'will', 'would', 'can',
  'been', 'their', 'which', 'when', 'there', 'could', 'should', 'after', 'before',
  'other', 'into', 'over', 'under', 'between', 'through', 'during', 'without',
  'within', 'against', 'among', 'while', 'where', 'these', 'those', 'because',
  'since', 'until', 'although', 'however', 'article', 'said', 'says',
  'some', 'onto', 'your', 'them', 'ahead', 'nearly', 'around',
  'above', 'across', 'along', 'behind', 'below', 'beneath', 'beside',
  'beyond', 'down', 'except', 'following', 'inside', 'minus', 'near', 'next',
  'opposite', 'outside', 'past', 'regarding', 'round', 'than', 'toward',
  'underneath', 'unlike', 'upon', 'versus', 'via', 'always', 'never', 'often',
  'sometimes', 'almost', 'quite', 'just', 'very', 'still', 'yet', 'already',
  'soon', 'late', 'later', 'earlier', 'much', 'many', 'few', 'any', 'all',
  'each', 'every', 'both', 'either', 'neither', 'only', 'also', 'even',
  'instead', 'then', 'thereby', 'therefore', 'away', 'back', 'far', 'long',
  'now', 'well', 'another', 'others', 'whole', 'full', 'rather', 'likely',
  'simply', 'mainly', 'mostly', 'largely', 'heavily', 'widely', 'closely',
  'clearly', 'quickly', 'early', 'together', 'further', 'certain', 'enough',
  'less', 'least', 'most', 'such', 'own', 'same', 'different', 'various',
  'several', 'little', 'world', 'global', 'national', 'local', 'public',
  'private', 'general', 'major',
]);

const BLACKLIST = new Set([
  'breaking', 'update', 'news', 'watch', 'report', 'live', 'today', 'video',
  'press', 'media', 'latest', 'exclusive', 'summary', 'read', 'click', 'source',
  'image', 'photo', 'copyright', 'rights', 'reserved', 'newsletter', 'email',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december', 'time', 'year', 'years', 'month', 'week',
  'day', 'hour', 'minute', 'second', 'moment', 'period', 'story',
]);

function normalizeTopic(topic) {
  return String(topic || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, '')
    .trim();
}

export function isNoiseTopic(topic) {
  const normalized = normalizeTopic(topic);
  if (!normalized || normalized.length < 4) return true;
  if (STOP_WORDS.has(normalized) || BLACKLIST.has(normalized)) return true;
  return normalized.split(/\s+/).some((token) => STOP_WORDS.has(token) || BLACKLIST.has(token));
}
