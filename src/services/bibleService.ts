
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

// Expanded collection of popular and inspiring verses
const popularVerses = [
  'JHN.3.16', // John 3:16
  'PSA.23.1-6', // Psalm 23 (full psalm)
  'ROM.8.28', // Romans 8:28
  'PHP.4.13', // Philippians 4:13
  'JER.29.11', // Jeremiah 29:11
  'ISA.41.10', // Isaiah 41:10
  'PRO.3.5-6', // Proverbs 3:5-6
  'MAT.28.19-20', // Matthew 28:19-20
  '1CO.13.4-8', // 1 Corinthians 13:4-8 (extended love passage)
  'PSA.46.1-3', // Psalm 46:1-3
  'ROM.8.38-39', // Romans 8:38-39
  'JOS.1.9', // Joshua 1:9
  'PSA.139.13-14', // Psalm 139:13-14
  'EPH.2.8-9', // Ephesians 2:8-9
  'MAT.5.3-12', // Beatitudes
  'JHN.14.6', // John 14:6
  'ROM.10.9', // Romans 10:9
  'GAL.5.22-23', // Fruits of the Spirit
  'HEB.11.1', // Hebrews 11:1
  'PSA.91.1-2', // Psalm 91:1-2
  'ISA.40.31', // Isaiah 40:31
  'MAT.6.26', // Matthew 6:26
  'JHN.1.1-5', // John 1:1-5
  'ROM.12.2', // Romans 12:2
  'PSA.121.1-2', // Psalm 121:1-2
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
    // First try the API
    const response = await fetch(
      `${BIBLE_API_BASE}/${DEFAULT_BIBLE_ID}/verses/${verseId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true`,
      {
        headers: {
          'api-key': 'your-api-key-here' // In production, this should be in environment variables
        }
      }
    );

    if (response.ok) {
      const data: BibleApiResponse = await response.json();
      
      if (data.data && data.data.verses && data.data.verses.length > 0) {
        const verses = data.data.verses;
        // Properly join all verses for ranges
        const fullText = verses.map((v, index) => {
          // Add verse numbers for multi-verse passages
          if (verses.length > 1) {
            return `${v.verse} ${v.text}`;
          }
          return v.text;
        }).join(' ');
        
        return {
          reference: data.data.reference,
          text: fullText,
          translation: 'ESV'
        };
      }
    }
    
    // Fall back to local verses if API fails
    return getFallbackVerse(verseId);
  } catch (error) {
    console.error('Error fetching verse:', error);
    return getFallbackVerse(verseId);
  }
};

export const searchVerses = async (query: string): Promise<BibleVerse[]> => {
  const topicVerses: { [key: string]: string[] } = {
    love: ['1CO.13.4-8', 'JHN.3.16', '1JN.4.8', 'JHN.15.12-13', 'ROM.5.8'],
    hope: ['JER.29.11', 'ROM.15.13', 'PSA.42.11', 'HEB.11.1', 'ROM.8.24-25'],
    faith: ['HEB.11.1', 'ROM.10.17', 'MAT.17.20', 'EPH.2.8-9', 'HEB.11.6'],
    peace: ['PHP.4.7', 'ISA.26.3', 'JHN.14.27', 'ROM.15.13', 'PSA.4.8'],
    strength: ['PHP.4.13', 'ISA.40.31', 'PSA.46.1', 'EPH.6.10', '2CO.12.9'],
    wisdom: ['PRO.3.5-6', 'JAM.1.5', 'PRO.27.17', 'ECL.3.1', 'PRO.2.6'],
    joy: ['NEH.8.10', 'PSA.16.11', 'JHN.15.11', 'GAL.5.22', 'PSA.30.5'],
    forgiveness: ['1JN.1.9', 'EPH.4.32', 'COL.3.13', 'MAT.6.14-15', 'PSA.103.12'],
    comfort: ['2CO.1.3-4', 'PSA.23.4', 'MAT.5.4', 'ISA.61.1-3', 'JHN.14.1'],
    salvation: ['ROM.10.9', 'EPH.2.8-9', 'JHN.3.16', 'ROM.6.23', 'ACT.16.31']
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
    'PSA.23.1-6': {
      reference: 'Psalm 23:1-6',
      text: '1 The Lord is my shepherd; I shall not want. 2 He makes me lie down in green pastures. He leads me beside still waters. 3 He restores my soul. He leads me in paths of righteousness for his name\'s sake. 4 Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me. 5 You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows. 6 Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever.',
      translation: 'ESV'
    },
    '1CO.13.4-8': {
      reference: '1 Corinthians 13:4-8',
      text: '4 Love is patient and kind; love does not envy or boast; it is not arrogant 5 or rude. It does not insist on its own way; it is not irritable or resentful; 6 it does not rejoice at wrongdoing, but rejoices with the truth. 7 Love bears all things, believes all things, hopes all things, endures all things. 8 Love never ends.',
      translation: 'ESV'
    },
    'MAT.5.3-12': {
      reference: 'Matthew 5:3-12',
      text: '3 Blessed are the poor in spirit, for theirs is the kingdom of heaven. 4 Blessed are those who mourn, for they shall be comforted. 5 Blessed are the meek, for they shall inherit the earth. 6 Blessed are those who hunger and thirst for righteousness, for they shall be satisfied. 7 Blessed are the merciful, for they shall receive mercy. 8 Blessed are the pure in heart, for they shall see God. 9 Blessed are the peacemakers, for they shall be called sons of God. 10 Blessed are those who are persecuted for righteousness\' sake, for theirs is the kingdom of heaven. 11 Blessed are you when others revile you and persecute you and utter all kinds of evil against you falsely on my account. 12 Rejoice and be glad, for your reward is great in heaven.',
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
