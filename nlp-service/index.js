const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nlp = require('compromise');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// Comprehensive stop-words: articles, pronouns, prepositions, conjunctions, adverbs, common verbs
const STOP_WORDS = new Set([
    // Articles & determiners
    'the', 'a', 'an', 'this', 'that', 'these', 'those', 'another', 'other', 'others',
    'each', 'every', 'all', 'both', 'neither', 'either', 'some', 'any', 'no',
    // Pronouns
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'who',
    'whom', 'which', 'what', 'whoever', 'whatever', 'whichever',
    // Prepositions
    'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'to', 'of',
    'around', 'beside', 'beyond', 'inside', 'outside', 'near', 'next', 'toward',
    'towards', 'upon', 'within', 'without', 'across', 'along', 'among', 'behind',
    'beneath', 'despite', 'except', 'opposite', 'past', 'regarding', 'since',
    'throughout', 'underneath', 'unlike', 'versus', 'via', 'plus', 'minus',
    // Conjunctions & connectors
    'and', 'but', 'or', 'nor', 'so', 'yet', 'for', 'because', 'although', 'though',
    'while', 'whereas', 'whether', 'unless', 'until', 'since', 'when', 'where',
    'if', 'as', 'than', 'that', 'however', 'therefore', 'thus', 'hence', 'still',
    // Common verbs
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'get', 'gets', 'got',
    'make', 'makes', 'made', 'take', 'takes', 'took', 'come', 'comes', 'came',
    'go', 'goes', 'went', 'know', 'knew', 'think', 'thought', 'see', 'saw',
    'said', 'say', 'says', 'told', 'tell', 'tells',
    // Common adverts / adjectives that add no topic value
    'more', 'most', 'less', 'least', 'very', 'too', 'quite', 'rather', 'enough',
    'almost', 'already', 'soon', 'just', 'only', 'even', 'also', 'back', 'away',
    'here', 'there', 'now', 'then', 'always', 'never', 'often', 'sometimes',
    'usually', 'generally', 'recently', 'ahead', 'nearly', 'barely', 'simply',
    'largely', 'mainly', 'mostly', 'heavily', 'highly', 'widely', 'closely',
    'clearly', 'quickly', 'likely', 'early', 'late', 'later', 'recently',
    'long', 'far', 'much', 'many', 'few', 'well', 'better', 'best', 'worse',
    'worst', 'big', 'small', 'large', 'new', 'old', 'first', 'last', 'same',
    'different', 'own', 'right', 'left', 'next', 'following', 'whole', 'full',
    // Generic news filler words
    'breaking', 'update', 'news', 'watch', 'report', 'live', 'today', 'video',
    'press', 'media', 'latest', 'exclusive', 'summary', 'read', 'click', 'source',
    'image', 'photo', 'copyright', 'rights', 'reserved', 'newsletter', 'email',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december',
    'time', 'year', 'years', 'month', 'months', 'week', 'weeks', 'day', 'days',
    'hour', 'hours', 'minute', 'minutes', 'second', 'seconds', 'moment', 'period',
    'story', 'article', 'post', 'thing', 'things', 'way', 'ways', 'part', 'parts',
    'people', 'person', 'man', 'woman', 'men', 'women', 'official', 'officials',
    'government', 'official', 'country', 'countries', 'world', 'global', 'national',
    'local', 'public', 'private', 'general', 'major', 'key', 'top', 'high', 'low',
    'number', 'numbers', 'percent', 'percentage', 'million', 'billion', 'thousand',
]);

function normalizeToken(token) {
    return token.toLowerCase().replace(/[^a-z0-9'-]/g, '').replace(/^'+|'+$/g, '');
}

function normalizePhrase(phrase) {
    return phrase
        .trim()
        .split(/\s+/)
        .map(normalizeToken)
        .filter(Boolean)
        .join(' ');
}

function isNoiseKeyword(phrase) {
    const normalized = normalizePhrase(phrase);
    if (!normalized || normalized.length < 3) return true;
    if (STOP_WORDS.has(normalized)) return true;
    const tokens = normalized.split(/\s+/);
    return tokens.some((token) => STOP_WORDS.has(token));
}

app.post('/keywords', (req, res) => {
    const { text, maxKeywords = 10 } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const doc = nlp(text);

        // Extract Entities (People, Places, Organizations) — highest priority
        const people = doc.people().out('array');
        const places = doc.places().out('array');
        const orgs = doc.organizations().out('array');
        const topics = doc.topics().out('array');

        // Extract Nouns as supplementary candidates
        const nouns = doc.nouns().out('array');

        // Combine with entity types getting higher weight
        const weighted = [
            ...topics.map(k => ({ word: k, weight: 4 })),
            ...people.map(k => ({ word: k, weight: 3 })),
            ...orgs.map(k => ({ word: k, weight: 3 })),
            ...places.map(k => ({ word: k, weight: 2 })),
            ...nouns.map(k => ({ word: k, weight: 1 })),
        ];

        const frequency = {};
        const rejected = [];
        weighted.forEach(({ word, weight }) => {
            const clean = normalizePhrase(word);
            if (!clean || isNoiseKeyword(clean)) {
                rejected.push(word);
                return;
            }
            if (/^\d+$/.test(clean)) {
                rejected.push(word);
                return;
            }

            frequency[clean] = (frequency[clean] || 0) + weight;
        });

        const sorted = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxKeywords)
            .map(entry => entry[0]);

        // #region agent log
        fetch('http://127.0.0.1:7489/ingest/a4e5ad49-7eae-456f-84eb-603849701193',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11efc6'},body:JSON.stringify({sessionId:'11efc6',location:'nlp-service/index.js:keywords',message:'keyword extraction result',data:{hypothesisId:'A',accepted:sorted,rejectedSample:rejected.slice(0,10),rejectedCount:rejected.length},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        res.json({ keywords: sorted });
    } catch (error) {
        console.error('NLP processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`NLP Service running on port ${PORT}`);
});
