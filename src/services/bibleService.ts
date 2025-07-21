
interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

interface BibleApiResponse {
  data: {
    id: string;
    orgId: string;
    reference: string;
    content: string;
    verseCount: number;
    copyright: string;
  };
}

interface BibleSearchResponse {
  data: {
    query: string;
    limit: number;
    offset: number;
    total: number;
    verseCount: number;
    verses: Array<{
      id: string;
      orgId: string;
      bookId: string;
      chapterIds: string[];
      reference: string;
      text: string;
    }>;
  };
}

const BIBLE_API_BASE = 'https://api.scripture.api.bible/v1';
const API_KEY = '197524e4f6c1be5128e85a4107041236';
const DEFAULT_BIBLE_ID = 'de4e12af7f28f599-02'; // English Standard Version

// Expanded collection of popular and inspiring verses with API.Bible verse IDs
const popularVerses = [
  'JHN.3.16', // John 3:16
  'PSA.23.1-PSA.23.6', // Psalm 23 (full psalm)
  'ROM.8.28', // Romans 8:28
  'PHP.4.13', // Philippians 4:13
  'JER.29.11', // Jeremiah 29:11
  'ISA.41.10', // Isaiah 41:10
  'PRO.3.5-PRO.3.6', // Proverbs 3:5-6
  'MAT.28.19-MAT.28.20', // Matthew 28:19-20
  '1CO.13.4-1CO.13.8', // 1 Corinthians 13:4-8 (extended love passage)
  'PSA.46.1-PSA.46.3', // Psalm 46:1-3
  'ROM.8.38-ROM.8.39', // Romans 8:38-39
  'JOS.1.9', // Joshua 1:9
  'PSA.139.13-PSA.139.14', // Psalm 139:13-14
  'EPH.2.8-EPH.2.9', // Ephesians 2:8-9
  'MAT.5.3-MAT.5.12', // Beatitudes
  'JHN.14.6', // John 14:6
  'ROM.10.9', // Romans 10:9
  'GAL.5.22-GAL.5.23', // Fruits of the Spirit
  'HEB.11.1', // Hebrews 11:1
  'PSA.91.1-PSA.91.2', // Psalm 91:1-2
  'ISA.40.31', // Isaiah 40:31
  'MAT.6.26', // Matthew 6:26
  'JHN.1.1-JHN.1.5', // John 1:1-5
  'ROM.12.2', // Romans 12:2
  'PSA.121.1-PSA.121.2', // Psalm 121:1-2
];

export const fetchRandomVerse = async (): Promise<BibleVerse | null> => {
  try {
    const randomVerse = popularVerses[Math.floor(Math.random() * popularVerses.length)];
    return await fetchVerse(randomVerse);
  } catch (error) {
    console.error('Error fetching random verse:', error);
    return getFallbackVerse('JHN.3.16');
  }
};

export const fetchVerse = async (verseId: string): Promise<BibleVerse | null> => {
  try {
    const response = await fetch(
      `${BIBLE_API_BASE}/bibles/${DEFAULT_BIBLE_ID}/passages/${verseId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true`,
      {
        headers: {
          'api-key': API_KEY
        }
      }
    );

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      return getFallbackVerse(verseId);
    }

    const data: BibleApiResponse = await response.json();
    
    // Clean up the text content - remove HTML tags and extra whitespace
    const cleanText = data.data.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    return {
      reference: data.data.reference,
      text: cleanText,
      translation: 'ESV'
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    return getFallbackVerse(verseId);
  }
};

// Enhanced function to handle both reference lookups (John 3:16) and keyword searches
const parseVerseReference = (query: string): string | null => {
  // Patterns for verse references: "John 3:16", "1 Corinthians 13:4-8", "Psalm 23", etc.
  const patterns = [
    /^(\d?\s*[A-Za-z]+)\s*(\d+):(\d+)(?:-(\d+))?$/i, // John 3:16 or John 3:16-17
    /^(\d?\s*[A-Za-z]+)\s*(\d+)$/i, // Psalm 23 (whole chapter)
  ];

  // Book name mappings for common abbreviations
  const bookMappings: { [key: string]: string } = {
    'jn': 'JHN', 'john': 'JHN',
    'ps': 'PSA', 'psalm': 'PSA', 'psalms': 'PSA',
    'rom': 'ROM', 'romans': 'ROM',
    'php': 'PHP', 'phil': 'PHP', 'philippians': 'PHP',
    'jer': 'JER', 'jeremiah': 'JER',
    'isa': 'ISA', 'isaiah': 'ISA',
    'pro': 'PRO', 'prov': 'PRO', 'proverbs': 'PRO',
    'mat': 'MAT', 'matt': 'MAT', 'matthew': 'MAT',
    '1co': '1CO', '1 cor': '1CO', '1 corinthians': '1CO',
    'jos': 'JOS', 'joshua': 'JOS',
    'eph': 'EPH', 'ephesians': 'EPH',
    'gal': 'GAL', 'galatians': 'GAL',
    'heb': 'HEB', 'hebrews': 'HEB',
    'jam': 'JAM', 'james': 'JAM',
    'jhn': 'JHN', // alternate
    '1jn': '1JN', '1 john': '1JN',
    'act': 'ACT', 'acts': 'ACT',
    'neh': 'NEH', 'nehemiah': 'NEH',
    'ecl': 'ECL', 'ecc': 'ECL', 'ecclesiastes': 'ECL',
    '2co': '2CO', '2 cor': '2CO', '2 corinthians': '2CO',
    'col': 'COL', 'colossians': 'COL'
  };

  for (const pattern of patterns) {
    const match = query.trim().match(pattern);
    if (match) {
      const bookName = match[1].toLowerCase().trim();
      const chapter = match[2];
      const verse = match[3];
      const endVerse = match[4];

      // Get the proper book abbreviation
      const bookCode = bookMappings[bookName] || bookName.toUpperCase();

      if (verse) {
        // Specific verse(s)
        if (endVerse) {
          return `${bookCode}.${chapter}.${verse}-${bookCode}.${chapter}.${endVerse}`;
        } else {
          return `${bookCode}.${chapter}.${verse}`;
        }
      } else {
        // Whole chapter
        return `${bookCode}.${chapter}`;
      }
    }
  }

  return null;
};

export const searchVerses = async (query: string): Promise<BibleVerse[]> => {
  try {
    // First, try to parse as a verse reference
    const verseId = parseVerseReference(query);
    if (verseId) {
      const verse = await fetchVerse(verseId);
      return verse ? [verse] : [];
    }

    // Fall back to keyword search
    const response = await fetch(
      `${BIBLE_API_BASE}/bibles/${DEFAULT_BIBLE_ID}/search?query=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'api-key': API_KEY
        }
      }
    );

    if (!response.ok) {
      console.error('Search API response not ok:', response.status, response.statusText);
      return getTopicVerses(query);
    }

    const data: BibleSearchResponse = await response.json();
    
    return data.data.verses.map(verse => ({
      reference: verse.reference,
      text: verse.text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      translation: 'ESV'
    }));
  } catch (error) {
    console.error('Error searching verses:', error);
    return getTopicVerses(query);
  }
};

const getTopicVerses = async (query: string): Promise<BibleVerse[]> => {
  const topicVerses: { [key: string]: string[] } = {
    love: ['1CO.13.4-1CO.13.8', 'JHN.3.16', '1JN.4.8', 'JHN.15.12-JHN.15.13', 'ROM.5.8'],
    hope: ['JER.29.11', 'ROM.15.13', 'PSA.42.11', 'HEB.11.1', 'ROM.8.24-ROM.8.25'],
    faith: ['HEB.11.1', 'ROM.10.17', 'MAT.17.20', 'EPH.2.8-EPH.2.9', 'HEB.11.6'],
    peace: ['PHP.4.7', 'ISA.26.3', 'JHN.14.27', 'ROM.15.13', 'PSA.4.8'],
    strength: ['PHP.4.13', 'ISA.40.31', 'PSA.46.1', 'EPH.6.10', '2CO.12.9'],
    wisdom: ['PRO.3.5-PRO.3.6', 'JAM.1.5', 'PRO.27.17', 'ECL.3.1', 'PRO.2.6'],
    joy: ['NEH.8.10', 'PSA.16.11', 'JHN.15.11', 'GAL.5.22', 'PSA.30.5'],
    forgiveness: ['1JN.1.9', 'EPH.4.32', 'COL.3.13', 'MAT.6.14-MAT.6.15', 'PSA.103.12'],
    comfort: ['2CO.1.3-2CO.1.4', 'PSA.23.4', 'MAT.5.4', 'ISA.61.1-ISA.61.3', 'JHN.14.1'],
    salvation: ['ROM.10.9', 'EPH.2.8-EPH.2.9', 'JHN.3.16', 'ROM.6.23', 'ACT.16.31']
  };

  const lowerQuery = query.toLowerCase();
  const matchingTopic = Object.keys(topicVerses).find(topic => 
    lowerQuery.includes(topic)
  );

  if (matchingTopic) {
    const verses = await Promise.all(
      topicVerses[matchingTopic].map(verseId => fetchVerse(verseId))
    );
    return verses.filter(verse => verse !== null) as BibleVerse[];
  }

  return [];
};

const getFallbackVerse = (verseId: string): BibleVerse => {
  const fallbackVerses: { [key: string]: BibleVerse } = {
    'JHN.3.16': {
      reference: 'John 3:16',
      text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
      translation: 'ESV'
    },
    'PSA.23.1': {
      reference: 'Psalm 23:1',
      text: 'The Lord is my shepherd; I shall not want.',
      translation: 'ESV'
    },
    'PSA.23.1-PSA.23.6': {
      reference: 'Psalm 23:1-6',
      text: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name\'s sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me. You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows. Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever.',
      translation: 'ESV'
    },
    'PHP.4.13': {
      reference: 'Philippians 4:13',
      text: 'I can do all things through him who strengthens me.',
      translation: 'ESV'
    },
    'JER.29.11': {
      reference: 'Jeremiah 29:11',
      text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
      translation: 'ESV'
    }
  };

  return fallbackVerses[verseId] || fallbackVerses['JHN.3.16'];
};
