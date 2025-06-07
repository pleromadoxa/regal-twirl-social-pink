
interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

interface BibleApiResponse {
  data: {
    reference: string;
    verses: Array<{
      book_id: string;
      book_name: string;
      chapter: number;
      verse: number;
      text: string;
    }>;
  };
}

const BIBLE_API_BASE = 'https://api.scripture.api.bible/v1/bibles';
const DEFAULT_BIBLE_ID = 'de4e12af7f28f599-02'; // English Standard Version

export const fetchRandomVerse = async (): Promise<BibleVerse | null> => {
  try {
    // Popular verses for random selection
    const popularVerses = [
      'JHN.3.16', // John 3:16
      'PSA.23.1', // Psalm 23:1
      'ROM.8.28', // Romans 8:28
      'PHP.4.13', // Philippians 4:13
      'JER.29.11', // Jeremiah 29:11
      'ISA.41.10', // Isaiah 41:10
      'PRO.3.5-6', // Proverbs 3:5-6
      'MAT.28.20', // Matthew 28:20
      '1CO.13.4-7', // 1 Corinthians 13:4-7
      'PSA.46.1' // Psalm 46:1
    ];

    const randomVerse = popularVerses[Math.floor(Math.random() * popularVerses.length)];
    return await fetchVerse(randomVerse);
  } catch (error) {
    console.error('Error fetching random verse:', error);
    return null;
  }
};

export const fetchVerse = async (verseId: string): Promise<BibleVerse | null> => {
  try {
    const response = await fetch(
      `${BIBLE_API_BASE}/${DEFAULT_BIBLE_ID}/verses/${verseId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false`,
      {
        headers: {
          'api-key': 'your-api-key-here' // In production, this should be in environment variables
        }
      }
    );

    if (!response.ok) {
      // Fallback to local verses if API fails
      return getFallbackVerse(verseId);
    }

    const data: BibleApiResponse = await response.json();
    
    return {
      reference: data.data.reference,
      text: data.data.verses[0]?.text || '',
      translation: 'ESV'
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    return getFallbackVerse(verseId);
  }
};

export const searchVerses = async (query: string): Promise<BibleVerse[]> => {
  // For now, return some popular verses related to common topics
  const topicVerses: { [key: string]: string[] } = {
    love: ['1CO.13.4-7', 'JHN.3.16', '1JN.4.8'],
    hope: ['JER.29.11', 'ROM.15.13', 'PSA.42.11'],
    faith: ['HEB.11.1', 'ROM.10.17', 'MAT.17.20'],
    peace: ['PHP.4.7', 'ISA.26.3', 'JHN.14.27'],
    strength: ['PHP.4.13', 'ISA.40.31', 'PSA.46.1'],
    wisdom: ['PRO.3.5-6', 'JAM.1.5', 'PRO.27.17']
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
