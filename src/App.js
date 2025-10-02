//Imports
import React, {useRef, useState} from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
    TrendingUp,
    Activity,
    BarChart3,
    Crown,
    Trophy,
    ChartArea,
} from 'lucide-react';

const App = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [liveAnalysis, setLiveAnalysis] = useState(null);
    const [transcriptSearchQuery, setTranscriptSearchQuery] = useState('');
    const [activeTimeouts, setActiveTimeouts] = useState([]);
    const [debateSegments, setDebateSegments] = useState([]);
    const [expandedTurningPoints, setExpandedTurningPoints] = useState({});
    const [selectedDebate, setSelectedDebate] = useState(null);
    const [selectedYear, setSelectedYear] = useState('2024');
    const [isGraphExpanded, setIsGraphExpanded] = useState(false);
    const [candidateScores, setCandidateScores] = useState({
        democrat: { name: 'Democrat', score: 0, segments: 0 },
        republican: { name: 'Republican', score: 0, segments: 0 }
    });
    const [debateTranscript, setDebateTranscript] = useState('');
    const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
    const [transcriptError, setTranscriptError] = useState('');
    const [debateStats, setDebateStats] = useState({
        zingers: 0,
        comebacks: 0,
        interruptions: 0,
        factChecks: 0
    });
    const [parsedSegments, setParsedSegments] = useState([]);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
    const [segmentScores, setSegmentScores] = useState({});
    const [analysisSpeed, setAnalysisSpeed] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [debateSummary, setDebateSummary] = useState(null);
    const [turningPoints, setTurningPoints] = useState([]);
    const [showFullTranscript, setShowFullTranscript] = useState(false);
    const [analyzedTranscriptLines, setAnalyzedTranscriptLines] = useState([]);

    const analysisSpeedRef = useRef(1);


    //Party Colors
    const PARTY_COLORS = {
        democrat: '#3b82f6',
        republican: '#dc2626',
        democratLight: '#60a5fa',
        republicanLight: '#f87171'
    };

    //Presidential Debates
    const PRESIDENTIAL_DEBATES = {
        2024: [
            {
                id: '2024_debate_1',
                title: 'Biden vs Trump - June 27, 2024',
                date: 'June 27, 2024',
                location: 'CNN Studios, Atlanta',
                candidates: { dem: 'Joe Biden', rep: 'Donald Trump' },
                topics: ['economy', 'inflation', 'immigration', 'abortion', 'fitness', 'scandal']
            },
            {
                id: '2024_debate_2',
                title: 'Harris vs Trump - September 10, 2024',
                date: 'September 10, 2024',
                location: 'Philadelphia, PA',
                candidates: { dem: 'Kamala Harris', rep: 'Donald Trump' },
                topics: ['abortion', 'immigration', 'economy', 'democracy', 'foreign_policy']
            }
        ],
        2020: [
            {
                id: '2020_debate_1',
                title: 'Biden vs Trump - September 29, 2020',
                date: 'September 29, 2020',
                location: 'Case Western Reserve University, Cleveland, OH',
                candidates: { dem: 'Joe Biden', rep: 'Donald Trump' },
                topics: ['covid', 'economy', 'race', 'healthcare', 'scandal']
            },
            {
                id: '2020_debate_2',
                title: 'Biden vs Trump - October 22, 2020',
                date: 'October 22, 2020',
                location: 'Belmont University, Nashville, TN',
                candidates: { dem: 'Joe Biden', rep: 'Donald Trump' },
                topics: ['covid', 'healthcare', 'race', 'climate', 'economy']
            }
        ],
        2016: [
            {
                id: '2016_debate_1',
                title: 'Clinton vs Trump - September 26, 2016',
                date: 'September 26, 2016',
                location: 'Hofstra University, Hempstead, NY',
                candidates: { dem: 'Hillary Clinton', rep: 'Donald Trump' },
                topics: ['economy', 'taxes', 'race', 'terrorism', 'scandal']
            },
            {
                id: '2016_debate_2',
                title: 'Clinton vs Trump - October 9, 2016',
                date: 'October 9, 2016',
                location: 'Washington University, St. Louis, MO',
                candidates: { dem: 'Hillary Clinton', rep: 'Donald Trump' },
                topics: ['scandal', 'healthcare', 'taxes', 'immigration', 'foreign_policy']
            },
            {
                id: '2016_debate_3',
                title: 'Clinton vs Trump - October 19, 2016',
                date: 'October 19, 2016',
                location: 'University of Nevada, Las Vegas, NV',
                candidates: { dem: 'Hillary Clinton', rep: 'Donald Trump' },
                topics: ['immigration', 'economy', 'abortion', 'foreign_policy', 'fitness']
            }
        ],
        2012: [
            {
                id: '2012_debate_1',
                title: 'Obama vs Romney - October 3, 2012',
                date: 'October 3, 2012',
                location: 'University of Denver, Denver, CO',
                candidates: { dem: 'Barack Obama', rep: 'Mitt Romney' },
                topics: ['economy', 'jobs', 'healthcare', 'taxes', 'education']
            },
            {
                id: '2012_debate_2',
                title: 'Obama vs Romney - October 16, 2012',
                date: 'October 16, 2012',
                location: 'Hofstra University, Hempstead, NY',
                candidates: { dem: 'Barack Obama', rep: 'Mitt Romney' },
                topics: ['economy', 'jobs', 'taxes', 'immigration', 'energy']
            },
            {
                id: '2012_debate_3',
                title: 'Obama vs Romney - October 22, 2012',
                date: 'October 22, 2012',
                location: 'Lynn University, Boca Raton, FL',
                candidates: { dem: 'Barack Obama', rep: 'Mitt Romney' },
                topics: ['foreign_policy', 'military', 'terrorism', 'economy']
            }
        ],
        2008: [
            {
                id: '2008_debate_1',
                title: 'Obama vs McCain - September 26, 2008',
                date: 'September 26, 2008',
                location: 'University of Mississippi, Oxford, MS',
                candidates: { dem: 'Barack Obama', rep: 'John McCain' },
                topics: ['economy', 'jobs', 'foreign_policy', 'military', 'terrorism']
            },
            {
                id: '2008_debate_2',
                title: 'Obama vs McCain - October 7, 2008',
                date: 'October 7, 2008',
                location: 'Belmont University, Nashville, TN',
                candidates: { dem: 'Barack Obama', rep: 'John McCain' },
                topics: ['economy', 'healthcare', 'jobs', 'energy', 'taxes']
            },
            {
                id: '2008_debate_3',
                title: 'Obama vs McCain - October 15, 2008',
                date: 'October 15, 2008',
                location: 'Hofstra University, Hempstead, NY',
                candidates: { dem: 'Barack Obama', rep: 'John McCain' },
                topics: ['economy', 'taxes', 'education', 'healthcare', 'abortion']
            }
        ],
        2004: [
            {
                id: '2004_debate_1',
                title: 'Kerry vs Bush - September 30, 2004',
                date: 'September 30, 2004',
                location: 'University of Miami, Coral Gables, FL',
                candidates: { dem: 'John Kerry', rep: 'George W. Bush' },
                topics: ['terrorism', 'military', 'foreign_policy', 'iraq']
            },
            {
                id: '2004_debate_2',
                title: 'Kerry vs Bush - October 8, 2004',
                date: 'October 8, 2004',
                location: 'Washington University, St. Louis, MO',
                candidates: { dem: 'John Kerry', rep: 'George W. Bush' },
                topics: ['healthcare', 'economy', 'taxes', 'jobs', 'social_security']
            },
            {
                id: '2004_debate_3',
                title: 'Kerry vs Bush - October 13, 2004',
                date: 'October 13, 2004',
                location: 'Arizona State University, Tempe, AZ',
                candidates: { dem: 'John Kerry', rep: 'George W. Bush' },
                topics: ['healthcare', 'abortion', 'education', 'immigration', 'taxes']
            }
        ],
        2000: [
            {
                id: '2000_debate_1',
                title: 'Gore vs Bush - October 3, 2000',
                date: 'October 3, 2000',
                location: 'University of Massachusetts, Boston, MA',
                candidates: { dem: 'Al Gore', rep: 'George W. Bush' },
                topics: ['economy', 'taxes', 'social_security', 'healthcare', 'education']
            },
            {
                id: '2000_debate_2',
                title: 'Gore vs Bush - October 11, 2000',
                date: 'October 11, 2000',
                location: 'Wake Forest University, Winston-Salem, NC',
                candidates: { dem: 'Al Gore', rep: 'George W. Bush' },
                topics: ['healthcare', 'education', 'social_security', 'taxes', 'crime']
            },
            {
                id: '2000_debate_3',
                title: 'Gore vs Bush - October 17, 2000',
                date: 'October 17, 2000',
                location: 'Washington University, St. Louis, MO',
                candidates: { dem: 'Al Gore', rep: 'George W. Bush' },
                topics: ['foreign_policy', 'military', 'energy', 'education', 'taxes']
            }
        ]
    };

    const checkForStunner = (text, speaker, debate) => {
        const lowerText = text.toLowerCase();
        const lowerSpeaker = speaker.toLowerCase();

        // Debate-killing moments - positive scores help the speaker, negative hurt them
        const catastrophicMemes = [
            { pattern: /binders full of women/i, debate: '2012_debate_2', speaker: 'romney', multiplier: -10 },
            { pattern: /lockbox/i, debate: '2000_debate_1', speaker: 'gore', multiplier: -10 },
            { pattern: /47 percent|47%/i, debate: '2012_debate_1', speaker: 'romney', multiplier: -10 },
            { pattern: /pokemon go/i, debate: '2016_debate_', speaker: 'clinton', multiplier: -10 },
            { pattern: /basket of deplorables|deplorables/i, debate: '2016_debate_1', speaker: 'clinton', multiplier: -10 },
            { pattern: /horses and bayonets/i, debate: '2012_debate_3', speaker: 'obama', multiplier: 7 },
            { pattern: /you didn.t build that/i, debate: '2012_', speaker: 'romney', multiplier: -7 },
            { pattern: /please proceed/i, debate: '2012_debate_2', speaker: 'obama', multiplier: 7 },
            { pattern: /miss piggy/i, debate: '2016_debate_1', speaker: 'clinton', multiplier: 5 },
            { pattern: /eating.*pets|eating.*dogs|eating.*cats/i, debate: '2024_debate_2', speaker: 'trump', multiplier: -10 },
            { pattern: /will you shut up/i, debate: '2020_debate_1', speaker: 'biden', multiplier: 5 },
            { pattern: /stand back.*stand by/i, debate: '2020_debate_1', speaker: 'trump', multiplier: -10 },
            { pattern: /because you.d be in jail/i, debate: '2016_debate_2', speaker: 'trump', multiplier: 10 },
            { pattern: /only rosie o.donnell/i, debate: '2016_debate_1', speaker: 'trump', multiplier: 7 },
        ];

        for (const meme of catastrophicMemes) {
            if (meme.pattern.test(lowerText)) {
                // Check if both debate and speaker match
                const debateMatches = debate?.id?.includes(meme.debate) || meme.debate === '';
                const speakerMatches = lowerSpeaker.includes(meme.speaker);

                if (debateMatches && speakerMatches) {
                    return meme.multiplier;
                }
            }
        }

        if (debate?.id === '2012_debate_1' && lowerSpeaker.includes('romney')) {
            return 0.3;
        }
        if (debate?.id === '2012_debate_1' && lowerSpeaker.includes('obama')) {
            return -0.3;
        }

        if (debate?.id === '2024_debate_1' && lowerSpeaker.includes('biden')) {
            return -0.4;
        }
        if (debate?.id === '2024_debate_1' && lowerSpeaker.includes('trump')) {
            return 0.2;
        }

        if (debate?.id === '2024_debate_2' && lowerSpeaker.includes('harris')) {
            return 0.3;
        }

        if (debate?.id === '2000_debate_1' && lowerSpeaker.includes('gore')) {
            return -0.3;
        }

        if (debate?.id === '2016_debate_2' && lowerSpeaker.includes('trump')) {
            return 0.2;
        }



        return 0;
    };


    const calculateImpactScore = (segment, sentimentData, debate) => {
        const memePenalty = checkForStunner(segment.text, segment.speaker, debate);
        if (memePenalty !== 0 && Math.abs(memePenalty) > 1) { 
            return memePenalty;
        }

        const bias = memePenalty;

        const strongLanguage = /\b(wrong|false|lie|failed|disaster|weak)\b/i.test(segment.text);
        const confident = /\b(absolutely|clearly|obviously|fact is|let me be clear)\b/i.test(segment.text);
        const attack = /\b(opponent|failed|wrong|disaster)\b/i.test(segment.text);

        let baseScore = 0;
        if (sentimentData.sentiment === 'POSITIVE') {
            baseScore = sentimentData.confidence * 1.5;
        } else if (sentimentData.sentiment === 'NEGATIVE') {
            baseScore = -(sentimentData.confidence * 1.5);
        }

        if (sentimentData.sentiment === 'NEGATIVE' && (strongLanguage || attack || confident)) {
            baseScore = sentimentData.confidence * 1.8;
        }

        const topicMultipliers = {
            'economy': 1.3,
            'taxes': 1.2,
            'healthcare': 1.2,
            'immigration': 1.3,
            'abortion': 1.3,
            'jobs': 1.3,
            'unemployment': 1.3,
            'inflation': 1.3,
            'covid': 1.2,
            'race': 1.1,
            'civil_rights': 1.1,
            'democracy': 1.1,
            'foreign_policy': 1.0,
            'military': 1.0,
            'climate': 1.0,
            'energy': 1.1,
            'education': 1.0,
            'social_security': 1.2,
            'medicare': 1.2,
            'medicaid': 1.1,
            'crime': 1.2,
            'police': 1.1,
            'terrorism': 1.1,
            'scandal': 1.4,
            'corruption': 1.3,
            'experience': 1.0,
            'fitness': 1.2,
            'other': 1.0
        };

        const multiplier = topicMultipliers[segment.topic] || 1.0;
        const rhetoricalVariance = (Math.random() - 0.5) * 1.0;
        const finalScore = Math.max(-5, Math.min(5, (baseScore * multiplier) + rhetoricalVariance + bias));  // Add bias here
        return Math.round(finalScore * 10) / 10;
    };

    const generateSentimentAnalysis = (segment) => {
        const text = segment.text.toLowerCase();

        const positiveWords = [
            // Strong/assertive rhetoric
            'strong', 'strength', 'powerful', 'winning', 'win', 'victory', 'fight', 'fighter',
            'tough', 'toughness', 'stand up', 'fight back', 'push back', 'won\'t back down',

            // Economic promises
            'jobs', 'economy', 'growth', 'prosperity', 'wealth', 'success', 'opportunity',
            'middle class', 'working families', 'tax cuts', 'lower taxes', 'affordable',

            // Patriotic/nationalist
            'america first', 'make america', 'greatest country', 'american dream', 'our country',
            'freedom', 'liberty', 'constitution', 'founding fathers', 'patriots',

            // Security themes
            'safe', 'safety', 'secure', 'security', 'protect', 'defense', 'military', 'veterans',
            'law and order', 'tough on crime', 'border security',

            // Confident language
            'absolutely', 'without question', 'make no mistake', 'let me be clear', 'i will',
            'we will', 'i promise', 'guarantee', 'committed', 'determined',

            // Zingers
            'wrong', 'excuse me', 'let me finish', 'that\'s not true', 'fact check',

            // Bush era (2000-2008)
            'compassionate conservative', 'unite', 'uniter', 'leadership', 'experience',

            // Obama era (2008-2016)
            'hope', 'change', 'yes we can', 'fired up', 'ready to go', 'forward',

            // Trump era (2016-2024)
            'drain the swamp', 'fake news', 'make america great', 'america first', 'believe me',
            'many people', 'everybody knows', 'everybody says', 'like never before',
            'biggest', 'best', 'tremendous', 'incredible', 'amazing', 'beautiful', 'because you\'d be in jail',

            // Biden/Harris era (2020-2024)
            'build back', 'restore', 'heal', 'unite', 'folks', 'here\'s the deal',
            'not a joke', 'i mean it', 'come on', 'malarkey'
        ];

        const negativeWords = [
            // Signs of weakness/poor performance
            'uh', 'um', 'well', 'you know', 'i mean', 'sort of', 'kind of', 'maybe',
            'stutter', 'stumble', 'rambling', 'incoherent', 'confused', 'lost',
            'forgot', 'can\'t remember', 'don\'t recall', 'mumbling', 'trailing off',

            // Dodging/evasiveness
            'no comment', 'won\'t answer', 'dodge', 'avoided', 'didn\'t answer',
            'changed subject', 'deflect', 'pivot',

            // Being caught in lies
            'lied', 'lying', 'false', 'fact-checked', 'debunked', 'wrong', 'incorrect',
            'contradiction', 'flip-flop', 'flip flop', 'changed position', 'inconsistent',

            // Looking unprepared
            'unprepared', 'doesn\'t know', 'no plan', 'no idea', 'unclear', 'vague',

            // Gore-Bush (2000)
            'lockbox', 'lockbox', 'lockbox', 'sighing', 'sighs', 'fuzzy math',

            // Bush-Kerry (2004)
            'misunderestimate', 'strategery', 'i actually did vote for',

            // Obama-McCain (2008)
            'bomb bomb iran', 'fundamentals are strong', '$5 million',

            // Romney (2012)
            'binders full of women', '47 percent', 'corporations are people',

            // Clinton-Trump (2016)
            'deplorables', 'basket of deplorables', 'pokemon go', 'why aren\'t i 50 points',
            'emails', 'private server', 'benghazi', 'delete', 'bleachbit',
            'no puppet', 'wrong', 'sniff',

            // Biden-Trump (2020-2024)
            'will you shut up man', 'clown', 'sleepy', 'hiding in basement',
            'cognitive test', 'person woman man camera tv', 'bleach', 'inject disinfectant',
            'very fine people', 'stand back stand by', 'proud boys',
            'listen fat', 'lying dog-faced pony soldier', 'you ain\'t black',
            'pause', 'long pause', 'frozen', 'blank stare', 'lost his train',

            // General debate failures
            'embarrassing', 'disaster', 'trainwreck', 'meltdown', 'collapsed',
            'defeated', 'destroyed', 'humiliated', 'crushed', 'demolished',
            'weak', 'pathetic', 'sad', 'low energy', 'no stamina', 'tired',
            'couldn\'t defend', 'had no response', 'silent', 'speechless'
        ];

        let sentiment = 'NEUTRAL';
        let confidence = 0.6;

        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;

        if (positiveCount > negativeCount) {
            sentiment = 'POSITIVE';
            confidence = Math.min(0.95, 0.6 + (positiveCount * 0.1));
        } else if (negativeCount > positiveCount) {
            sentiment = 'NEGATIVE';
            confidence = Math.min(0.95, 0.6 + (negativeCount * 0.1));
        }

        return { sentiment, confidence };
    };

    // Determine Candidate
    const isDemocratCandidate = (speaker) => {
        const democratNames = ['Al Gore', 'Joe Biden', 'Barack Obama', 'Hillary Clinton', 'John Kerry', 'Kamala Harris'];
        const republicanNames = ['George W. Bush', 'Donald Trump', 'Mitt Romney', 'John McCain'];

        if (democratNames.includes(speaker)) {
            return true;
        }
        if (republicanNames.includes(speaker)) {
            return false;
        }

        const speakerLower = speaker.toLowerCase();
        if (democratNames.some(name => speakerLower.includes(name.toLowerCase()))) {
            return true;
        }
        if (republicanNames.some(name => speakerLower.includes(name.toLowerCase()))) {
            return false;
        }
        return false;
    };

    // Get Debate Transcript
    const fetchDebateTranscript = async (debate) => {
        setIsLoadingTranscript(true);
        setTranscriptError('');
        setDebateTranscript('');

        try {
            const debateNumber = debate.id.split('_')[2];
            const debateYear = debate.id.split('_')[0];
            const transcriptPath = `/debates/Pres_Debate_${debateNumber}_${debateYear}.txt`;

            console.log('Fetching transcript from:', transcriptPath);

            const response = await fetch(transcriptPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const transcriptContent = await response.text();
            console.log('Transcript loaded:', transcriptContent.length, 'characters');

            setDebateTranscript(transcriptContent);
            analyzeTranscriptInChunks(transcriptContent, debate);

        } catch (error) {
            console.error('Error fetching transcript:', error);
            setTranscriptError(`Failed to load transcript: ${error.message}`);

            console.log('Transcript failed, running demo analysis...');
            setTimeout(() => {
            }, 1000);
        } finally {
            setIsLoadingTranscript(false);
        }
    };

    // Transcript Chunks
    const analyzeTranscriptInChunks = (transcriptText, debate) => {
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        setActiveTimeouts([]);
        setDebateSegments([]);
        setDebateSummary(null);
        setTurningPoints([]);
        setAnalysisComplete(false);
        setCandidateScores({
            democrat: { name: debate.candidates.dem, score: 0, segments: 0 },
            republican: { name: debate.candidates.rep, score: 0, segments: 0 }
        });

        const segments = parseTranscriptIntoSegments(transcriptText, debate);

        if (segments.length === 0) {
            setTranscriptError('No valid segments found in transcript');
            setIsAnalyzing(false);
            return;
        }

        setParsedSegments(segments);

        let currentIndex = 0;
        const baseDelay = 1000;
        let localTimeouts = [];
        let accumulatedSegments = [];

        const processNextChunk = () => {
            if (isPaused) return;

            if (currentIndex < segments.length) {
                const segment = segments[currentIndex];
                setCurrentSegmentIndex(currentIndex);

                if (!segment.isModerator) {
                    const sentimentData = generateSentimentAnalysis(segment);
                    const impactScore = calculateImpactScore(segment, sentimentData, selectedDebate);

                    setSegmentScores(prev => ({
                        ...prev,
                        [currentIndex]: impactScore
                    }));

                    const analysisData = {
                        segment: {
                            speaker: segment.speaker,
                            text: segment.text,
                            topic: segment.topic,
                            impact_score: impactScore
                        },
                        sentiment: sentimentData,
                        topics: [segment.topic],
                        timestamp: currentIndex * 30
                    };

                    accumulatedSegments.push(analysisData);
                    setLiveAnalysis(analysisData);
                    setCurrentTime(analysisData.timestamp);
                    setDebateSegments(accumulatedSegments);

                    setAnalyzedTranscriptLines(prev => [...prev, {
                        speaker: segment.speaker,
                        text: segment.text,
                        impactScore: impactScore,
                        sentiment: sentimentData.sentiment,
                        segmentNumber: currentIndex + 1,
                        isDemocrat: isDemocratCandidate(segment.speaker),
                        isModerator: false
                    }]);

                    const party = isDemocratCandidate(segment.speaker) ? 'democrat' : 'republican';
                    setCandidateScores(prev => ({
                        ...prev,
                        [party]: {
                            ...prev[party],
                            score: prev[party].score + impactScore,
                            segments: prev[party].segments + 1
                        }
                    }));
                } else {
                    setAnalyzedTranscriptLines(prev => [...prev, {
                        speaker: segment.speaker,
                        text: segment.text,
                        impactScore: 0,
                        sentiment: 'NEUTRAL',
                        segmentNumber: currentIndex + 1,
                        isDemocrat: false,
                        isModerator: true
                    }]);
                }

                if (currentIndex + 1 < segments.length) {
                    currentIndex++;
                    const timeoutId = setTimeout(processNextChunk, baseDelay / analysisSpeedRef.current);
                    localTimeouts.push(timeoutId);
                } else {
                    currentIndex++;
                    console.log('Analysis complete, segments processed:', accumulatedSegments.length);

                    const timeoutId = setTimeout(() => {
                        console.log('Generating summary with', accumulatedSegments.length, 'segments');
                        generateDebateSummaryWithData(accumulatedSegments); // Pass the local data
                        setCurrentSegmentIndex(-1);
                        setIsAnalyzing(false);
                        setAnalysisComplete(true);
                    }, 1500);
                    localTimeouts.push(timeoutId);
                }
            }
        };

        const initialTimeout = setTimeout(() => {
            processNextChunk();
        }, 0);
        localTimeouts.push(initialTimeout);

        setActiveTimeouts(localTimeouts);
    };

    // Parse Transcript
    const parseTranscriptIntoSegments = (transcriptText, debate) => {
        const segments = [];
        const lines = transcriptText.split('\n');
        let currentSpeaker = '';
        let currentText = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const speakerMatch = line.match(/^(GORE|BUSH|BIDEN|TRUMP|HARRIS|CLINTON|OBAMA|ROMNEY|MCCAIN|KERRY|MODERATOR):\s*(.*)/);

            if (speakerMatch) {
                console.log('Found speaker:', speakerMatch[1], '-> mapped to:', mapSpeakerToCandidate(speakerMatch[1], debate));
                if (currentSpeaker) {
                    const textLength = currentText.trim().length;
                    console.log(`Processing previous speaker: ${currentSpeaker}, text length: ${textLength}`);
                    if (textLength <= 20) {
                        console.log(`FILTERED - too short: "${currentText.trim()}"`);
                    }
                }

                if (currentSpeaker && currentText.trim().length > 20) {
                    const candidateName = mapSpeakerToCandidate(currentSpeaker, debate) || currentSpeaker;
                    const cleanText = currentText.replace(/\\['`"]/g, "'").replace(/\s+/g, ' ').trim();
                    const topic = extractTopicFromText(cleanText);

                    segments.push({
                        speaker: candidateName,
                        text: cleanText,
                        topic: topic,
                        isModerator: currentSpeaker === 'MODERATOR'
                    });
                }

                currentSpeaker = speakerMatch[1];
                currentText = speakerMatch[2] || '';
            } else {
                currentText += ' ' + line;
            }
        }

        if (currentSpeaker && currentText.trim().length > 20) {
            const candidateName = mapSpeakerToCandidate(currentSpeaker, debate) || currentSpeaker;
            const cleanText = currentText.replace(/\\['`"]/g, "'").replace(/\s+/g, ' ').trim();
            const topic = extractTopicFromText(cleanText);

            segments.push({
                speaker: candidateName,
                text: cleanText,
                topic: topic,
                isModerator: currentSpeaker === 'MODERATOR'
            });
        }
        return segments;
    };

    // Connect Party To Candidate
    const mapSpeakerToCandidate = (speaker, debate) => {
        const speakerMap = {
            'GORE': debate.candidates.dem,
            'BUSH': debate.candidates.rep,
            'BIDEN': debate.candidates.dem,
            'TRUMP': debate.candidates.rep,
            'HARRIS': debate.candidates.dem,
            'CLINTON': debate.candidates.dem,
            'OBAMA': debate.candidates.dem,
            'ROMNEY': debate.candidates.rep,
            'MCCAIN': debate.candidates.rep,
            'KERRY': debate.candidates.dem,
            'DEMOCRAT': debate.candidates.dem,
            'REPUBLICAN': debate.candidates.rep,
            'MODERATOR': 'MODERATOR'
        };

        return speakerMap[speaker] || speaker;
    };

    // Topic From Text
    const extractTopicFromText = (text) => {
        const topicKeywords = {
            // Economy & Financial
            inflation: ['inflation', 'rising prices', 'cost of living', 'prices going up', 'afford'],
            unemployment: ['unemployment', 'jobless', 'out of work', 'lost jobs', 'layoffs'],
            jobs: ['jobs', 'employment', 'hiring', 'workers', 'labor market', 'wages', 'pay', 'salary'],
            taxes: ['tax', 'taxes', 'taxation', 'IRS', 'tax cuts', 'tax reform', 'deductions'],
            economy: ['economy', 'economic', 'GDP', 'recession', 'growth', 'prosperity', 'business'],

            // Healthcare
            social_security: ['social security', 'retirement', 'seniors', 'elderly benefits', 'pension'],
            medicare: ['medicare', 'health insurance', 'coverage', 'premiums'],
            medicaid: ['medicaid', 'low-income health'],
            healthcare: ['healthcare', 'health care', 'medical', 'hospital', 'prescription drugs', 'drug prices', 'obamacare', 'affordable care act', 'ACA'],

            // Social issues
            abortion: ['abortion', 'roe v wade', 'reproductive rights', 'pro-life', 'pro-choice', 'dobbs'],
            immigration: ['immigration', 'border', 'immigrant', 'visa', 'refugee', 'deportation', 'citizenship', 'asylum', 'illegal immigration', 'DACA', 'wall'],
            crime: ['crime', 'violent crime', 'murder rate', 'law and order', 'prosecution', 'criminal'],
            police: ['police', 'policing', 'law enforcement', 'cops', 'defund'],

            // Character & Fitness
            scandal: ['scandal', 'corruption', 'investigation', 'indictment', 'fraud', 'criminal charges', 'emails', 'classified documents'],
            corruption: ['corrupt', 'bribery', 'ethics', 'conflict of interest', 'pay to play'],
            fitness: ['cognitive', 'mental fitness', 'age', 'stamina', 'health', 'dementia', 'confused', 'gaffe'],
            experience: ['experience', 'qualified', 'background', 'record', 'resume'],

            // Foreign & Security
            foreign_policy: ['foreign policy', 'international', 'diplomacy', 'alliance', 'china', 'russia'],
            military: ['military', 'defense', 'armed forces', 'troops', 'veterans', 'war', 'afghanistan', 'iraq'],
            terrorism: ['terrorism', 'terrorist', 'national security', 'ISIS', 'Al Qaeda'],

            // Environment & Energy
            climate: ['climate', 'climate change', 'global warming', 'carbon', 'emissions', 'pollution', 'green energy'],
            energy: ['energy', 'oil', 'gas', 'gas prices', 'fossil fuels', 'renewable'],

            // Domestic Policy
            education: ['education', 'schools', 'student', 'college', 'university', 'tuition', 'student loans', 'teachers'],
            race: ['race', 'racial', 'racism', 'discrimination', 'BLM', 'black lives matter'],
            civil_rights: ['civil rights', 'equality', 'justice', 'freedom', 'LGBTQ', 'gay marriage', 'transgender'],
            democracy: ['democracy', 'voting rights', 'election integrity', 'january 6', 'capitol riot', 'insurrection'],

            covid: ['covid', 'coronavirus', 'pandemic', 'lockdown', 'masks', 'vaccine', 'social distancing']
        };

        text = text.toLowerCase();

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    return topic;
                }
            }
        }

        return 'other';
    };

    // Debate Summary
    const generateDebateSummaryWithData = (segmentsData) => {
        const momentumData = createMomentumDataFromSegments(segmentsData);
        console.log('=== DEBUG INFO ===');
        console.log('Total momentum data points:', momentumData.length);
        console.log('First 3 momentum points:', momentumData.slice(0, 5));
        console.log('Segments data length:', segmentsData.length);

        const turningPointsData = findTurningPoints(momentumData);
        console.log('Turning points found:', turningPointsData.length);
        console.log('Turning points data:', turningPointsData);

        const winner = candidateScores.democrat.score > candidateScores.republican.score
            ? candidateScores.democrat.name
            : candidateScores.republican.name;

        let democratLeadingTime = 0;
        let republicanLeadingTime = 0;

        if (momentumData.length > 0) {
            momentumData.forEach((data) => {
                if (data.momentum > 0.1) {
                    democratLeadingTime += 30;
                } else if (data.momentum < -0.1) {
                    republicanLeadingTime += 30;
                }
            });
        }

        const impactfulMoments = segmentsData
            .map((segment, index) => ({
                speaker: segment.segment?.speaker,
                impact: segment.segment?.impact_score || 0,
                text: segment.segment?.text?.substring(0, 120) + '...',
                segment: index + 1,
                topic: segment.segment?.topic,
                absImpact: Math.abs(segment.segment?.impact_score || 0)
            }))
            .sort((a, b) => b.absImpact - a.absImpact)
            .slice(0, 3);

        const summary = {
            winner,
            totalSegments: segmentsData.length,
            avgDemocratScore: candidateScores.democrat.segments > 0 ?
                (candidateScores.democrat.score / candidateScores.democrat.segments).toFixed(2) : 0,
            avgRepublicanScore: candidateScores.republican.segments > 0 ?
                (candidateScores.republican.score / candidateScores.republican.segments).toFixed(2) : 0,
            keyMoments: turningPointsData.slice(0, 3),
            finalMomentum: momentumData.length > 0 ? momentumData[momentumData.length - 1].momentum : 0,
            democratLeadingTime: Math.round(democratLeadingTime / 60),
            republicanLeadingTime: Math.round(republicanLeadingTime / 60),
            totalMomentumDemocrat: candidateScores.democrat.score,
            totalMomentumRepublican: Math.abs(candidateScores.republican.score),
            mostImpactfulMoments: impactfulMoments
        };

        setDebateSummary(summary);
        setTurningPoints(turningPointsData);
    };

    // Generate Momentum
    const createMomentumDataFromSegments = (segmentsData) => {
        if (segmentsData.length === 0) return [];

        let runningMomentum = 0;
        const data = segmentsData.map((segment, index) => {
            const isDemocrat = isDemocratCandidate(segment.segment?.speaker || '');
            const impactScore = segment.segment?.impact_score || 0;

            if (isDemocrat) {
                runningMomentum += impactScore;
            } else {
                runningMomentum -= impactScore;
            }

            runningMomentum = Math.max(-5, Math.min(5, runningMomentum));

            return {
                segment: index + 1,
                momentum: runningMomentum,
                isDemocratMomentum: runningMomentum > 0,
                speaker: segment.segment?.speaker,
                text: segment.segment?.text?.substring(0, 60) + '...',
                impact: impactScore
            };
        });

        return data;
    };

    // Turning Points In Debate
    const findTurningPoints = (data) => {
        console.log('Finding turning points in data:', data.length, 'segments');
        const points = [];

        for (let i = 1; i < data.length - 1; i++) {
            const prev = data[i - 1].momentum;
            const curr = data[i].momentum;
            const next = data[i + 1].momentum;

            if ((prev < curr && curr > next) || (prev > curr && curr < next)) {
                const change = Math.abs(curr - prev);
                console.log(`Turning point found at segment ${i}: ${prev} -> ${curr} -> ${next}`);
                points.push({
                    segment: i,
                    lineNumber: data[i].segment,
                    momentum: curr,
                    description: `Major momentum shift at segment ${i}`,
                    speaker: data[i].speaker,
                    text: data[i].text,
                    change: change,
                    impact: data[i].impact
                });
            }
        }

        if (points.length === 0) {
            console.log('No strict turning points found, finding biggest momentum changes');
            for (let i = 1; i < data.length; i++) {
                const prev = data[i - 1].momentum;
                const curr = data[i].momentum;
                const change = Math.abs(curr - prev);

                if (change > 0.1) {
                    points.push({
                        segment: i,
                        lineNumber: data[i].segment,
                        momentum: curr,
                        description: `Momentum change of ${change.toFixed(1)} at segment ${i}`,
                        speaker: data[i].speaker,
                        text: data[i].text,
                        change: change
                    });
                }
            }

            points.sort((a, b) => (b.change || 0) - (a.change || 0));
            points.splice(3);
        }

        console.log('Total turning points found:', points.length);
        return points;
    };

    // Reset For New Sequence
    const resetAnalysisState = () => {
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        setActiveTimeouts([]);
        setIsAnalyzing(false);
        setAnalysisComplete(false);
        setIsPaused(false);
        setDebateSummary(null);
        setTurningPoints([]);
        setDebateSegments([]);
        setCurrentTime(0);
        setLiveAnalysis(null);
        setParsedSegments([]);
        setCurrentSegmentIndex(-1);
        setSegmentScores({});
        setDebateTranscript('');
        setTranscriptError('');
        setIsLoadingTranscript(false);
        setDebateStats({
            zingers: 0,
            comebacks: 0,
            interruptions: 0,
            factChecks: 0
        });
        setCandidateScores({
            democrat: { name: 'Democrat', score: 0, segments: 0 },
            republican: { name: 'Republican', score: 0, segments: 0 }
        });
        setShowFullTranscript(false);
        setAnalyzedTranscriptLines([]);
    };

    // Debate Analysis Start
    const startDebateAnalysis = async (debate) => {
        resetAnalysisState();

        await new Promise(resolve => setTimeout(resolve, 100));
        setSelectedDebate(debate);
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setDebateSummary(null);
        setTurningPoints([]);
        setDebateSegments([]);
        setCurrentTime(0);
        setParsedSegments([]);
        setCurrentSegmentIndex(-1);
        setSegmentScores({});
        setAnalyzedTranscriptLines([]);
        setShowFullTranscript(false);
        setCandidateScores({
            democrat: { name: debate.candidates.dem, score: 0, segments: 0 },
            republican: { name: debate.candidates.rep, score: 0, segments: 0 }
        });
        await fetchDebateTranscript(debate);
    };

    // Time Format
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Debate Facts
    const getDebateFact = (debate) => {
        if (!debate) return "Select a debate to see interesting facts!";
        const facts = {
            '2024_debate_1': "Biden's halting performance in this debate triggered a Democratic panic. Within weeks, major donors froze funding and party leaders privately urged him to withdraw. He dropped out 24 days later - the first time an incumbent president abandoned re-election this late in a campaign.",
            '2024_debate_2': "Harris prosecuted Trump on abortion rights and January 6th while he claimed immigrants were 'eating pets.' Post-debate polls showed Harris gained significant ground, particularly among suburban women and independents in swing states.",
            '2020_debate_1': "Trump's constant interruptions were so disruptive that the Commission on Presidential Debates implemented muted microphones for future debates - the first structural change to debate format in decades. Biden's 'Will you shut up, man?' became a cultural touchstone.",
            '2020_debate_2': "Trump's refusal to denounce white supremacists, instead telling the Proud Boys to 'stand back and stand by,' sparked immediate national outrage. The group adopted the phrase as a rallying cry, and Trump's polling dropped 2-3 points in swing states.",
            '2016_debate_1': "Trump's comment that not paying federal taxes 'makes me smart' and his admission he called a Miss Universe winner 'Miss Piggy' damaged his appeal with women voters. Post-debate polls showed Clinton won decisively, 62% to 27%.",
            '2016_debate_2': "This debate occurred 48 hours after the Access Hollywood tape leak. Trump brought Bill Clinton's accusers to the debate hall. Despite predictions he would implode, Trump's aggressive performance stabilized his campaign and he went on to win.",
            '2016_debate_3': "Trump's refusal to commit to accepting election results ('I'll keep you in suspense') was unprecedented in modern debate history. Republican leaders including Paul Ryan and Mitch McConnell publicly broke with him the next day, calling it a threat to democratic norms. His polling dropped 2-3 points in key swing states.",            '2012_debate_1': "Obama's listless performance caused Democratic panic - his polling lead evaporated overnight. Pundits called it the worst debate performance by an incumbent president in modern history. Romney surged and polls became tied for weeks.",
            '2012_debate_2': "Romney's gaffe about having 'binders full of women' became an instant meme and highlighted his awkwardness on women's issues. Obama's aggressive comeback from the first debate sealed Romney's fate.",
            '2012_debate_3': "Romney's claim that the Navy had fewer ships than in 1916 led to Obama's cutting response: 'We also have fewer horses and bayonets.' The viral moment reinforced Romney's image as out-of-touch and ended his comeback momentum.",
            '2008_debate_1': "McCain's bizarre announcement he was 'suspending his campaign' to deal with the financial crisis, then showing up anyway, made him look erratic. Obama appeared steady and presidential. McCain never recovered his polling lead.",
            '2008_debate_2': "McCain's dismissive 'that one' reference to Obama was seen as condescending and possibly racially coded. His poll numbers dropped immediately after. Obama's calm demeanor contrasted sharply with McCain's agitation.",
            '2008_debate_3': "McCain's mocking of abortion exceptions for women's 'health' - complete with air quotes - alienated women voters. His mention of 'Joe the Plumber' became a symbol of his campaign's disconnect from reality.",
            '2004_debate_1': "Kerry's strong performance reversed his post-Swift Boat polling deficit. Bush appeared irritated and defensive. Kerry gained 8 points in polls, making the race competitive again after Bush had led for months.",
            '2004_debate_2': "Bush's defensive body language and visible frustration made him appear less presidential. Kerry's prosecutorial style and command of foreign policy details convinced undecided voters he was a credible commander-in-chief.",
            '2004_debate_3': "When asked about homosexuality, Kerry spoke movingly about Dick Cheney's lesbian daughter Mary. Cheney's wife Lynne angrily accused Kerry of exploiting their daughter. The controversy dominated news cycles and may have cost Kerry votes.",
            '2000_debate_1': "Gore's eye-rolling and audible sighs while Bush spoke were captured by cameras and became the story. Saturday Night Live's parody was devastating. Gore's commanding policy knowledge was overshadowed by seeming condescending and unlikeable.",
            '2000_debate_2': "Gore's decision to physically approach Bush during an answer - invading his personal space - backfired when Bush casually nodded at him. Gore's aggressive tactics reinforced his reputation for phoniness.",
            '2000_debate_3': "Bush's strategy of appearing likeable and reasonable worked. Despite Gore's policy superiority, Bush's 'compassionate conservative' message and everyman appeal won over undecided voters. The race tightened dramatically, leading to the Florida recount."
        };

        return facts[debate.id] || "This historic debate shaped American politics in significant ways.";
    };

    // Create Momentum Display Data
    const createMomentumData = () => {
        if (debateSegments.length === 0) return [];

        let runningMomentum = 0;
        const data = debateSegments.map((segment, index) => {
            const isDemocrat = isDemocratCandidate(segment.segment?.speaker || '');
            const impactScore = segment.segment?.impact_score || 0;

            if (isDemocrat) {
                runningMomentum += impactScore;
            } else {
                runningMomentum -= impactScore;
            }

            runningMomentum = Math.max(-5, Math.min(5, runningMomentum));

            return {
                segment: index + 1,
                momentum: runningMomentum,
                isDemocratMomentum: runningMomentum > 0,
                speaker: segment.segment?.speaker,
                text: segment.segment?.text?.substring(0, 60) + '...',
                impact: impactScore
            };
        });

        return data;
    };

    const momentumData = createMomentumData();
    const currentMomentum = momentumData.length > 0 ? momentumData[momentumData.length - 1].momentum : 0;
    const isDemocratLeading = currentMomentum > 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '0.75rem',
                    color: '#ffffff'
                }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                        {data.speaker}
                    </p>
                    <p style={{ margin: '0 0 4px 0' }}>
                        Momentum: {data.momentum?.toFixed(1)}
                    </p>
                    <p style={{ margin: '0 0 4px 0' }}>
                        Impact: {data.impact > 0 ? '+' : ''}{data.impact?.toFixed(1)}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.7rem', color: '#9ca3af' }}>
                        {data.text}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Winning Candidate
    const getWinningCandidate = () => {
        if (candidateScores.democrat.score > candidateScores.republican.score) {
            return { party: candidateScores.democrat.name, color: PARTY_COLORS.democrat };
        } else if (candidateScores.republican.score > candidateScores.democrat.score) {
            return { party: candidateScores.republican.name, color: PARTY_COLORS.republican };
        }
        return null;
    };

    const winner = getWinningCandidate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0e1a',
            color: '#e2e8f0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                borderBottom: '2px solid #374151',
                padding: '20px 0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: '800',
                                background: 'linear-gradient(90deg, #dc2626 0%, #dc2626 45%, #1e40af 55%, #1e40af 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                margin: '0',
                                letterSpacing: '1px',
                                display: 'inline-block'
                            }}>
                                LockBox
                            </h1>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#cbd5e1',
                                margin: '6px 0 0 0',
                                fontWeight: '500'
                            }}>
                                Real-time sentiment analysis of presidential debates
                            </p>
                        </div>
                    </div>

                    {isAnalyzing && selectedDebate && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            background: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: isPaused ? '#f59e0b' : '#22c55e'
                            }}></div>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#ffffff' }}>
                                {isPaused ? 'PAUSED' : 'ANALYZING'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatTime(currentTime)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
                {/* Debate Selection */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid #475569',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.4)'
                }}>
                    <h2 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#ffffff',
                        margin: '0 0 16px 0'
                    }}>
                        Select Presidential Debate
                    </h2>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        {Object.keys(PRESIDENTIAL_DEBATES).sort((a, b) => b - a).map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: selectedYear === year ? '2px solid #3b82f6' : '1px solid #374151',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    background: selectedYear === year ? 'linear-gradient(135deg, #1e40af, #1e3a8a)' : '#1f2937',
                                    color: selectedYear === year ? '#ffffff' : '#9ca3af',
                                    boxShadow: selectedYear === year ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '12px'
                    }}>
                        {PRESIDENTIAL_DEBATES[selectedYear]?.map(debate => (
                            <div
                                key={debate.id}
                                onClick={() => startDebateAnalysis(debate)}
                                style={{
                                    padding: '16px',
                                    background: selectedDebate?.id === debate.id ? 'linear-gradient(135deg, #1e40af, #1e3a8a)' : 'linear-gradient(135deg, #1f2937, #111827)',
                                    border: selectedDebate?.id === debate.id ? '2px solid #3b82f6' : '1px solid #374151',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: selectedDebate?.id === debate.id ? '0 4px 12px rgba(59, 130, 246, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <div style={{
                                    fontSize: '0.975rem',
                                    fontWeight: '600',
                                    marginBottom: '6px',
                                    color: '#ffffff'
                                }}>
                                    {debate.title}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#9ca3af',
                                    marginBottom: '8px'
                                }}>
                                    {debate.date} • {debate.location}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '500' }}>
                                        {debate.candidates.dem}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>vs</div>
                                    <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
                                        {debate.candidates.rep}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analysis Controls */}
                {isAnalyzing && (
                    <div style={{
                        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 20px rgba(31, 41, 55, 0.4)'
                    }}>


                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #1f2937, #111827)',
                            borderRadius: '8px',
                            border: '1px solid #374151'
                        }}>
                            <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: '600' }}>Speed:</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[0.5, 1, 2, 4].map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => {
                                            setAnalysisSpeed(speed);
                                            analysisSpeedRef.current = speed;
                                        }}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '0.75rem',
                                            background: analysisSpeed === speed ? '#3b82f6' : '#374151',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            width: '200px',
                            height: '6px',
                            background: 'linear-gradient(135deg, #1f2937, #111827)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            border: '1px solid #374151',
                            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)'
                        }}>
                            <div style={{
                                width: `${((currentSegmentIndex + 1) / parsedSegments.length) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                                transition: 'width 0.3s ease',
                                boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
                            }}></div>
                        </div>
                    </div>
                )}

                {/* Winner Display */}
                {winner && debateSegments.length > 2 && (
                    <div style={{
                        padding: '16px',
                        background: `linear-gradient(135deg, ${winner.color}15, ${winner.color}05)`,
                        border: `2px solid ${winner.color}`,
                        borderRadius: '8px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: `0 4px 20px ${winner.color}40`
                    }}>
                        <Crown size={20} color={winner.color} />
                        <span style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: winner.color
                        }}>
                            Current Leader: {winner.party}
                        </span>
                    </div>
                )}

                {/* Force summary if analysis is complete but summary is missing */}
                {!isAnalyzing && debateSegments.length > 0 && !analysisComplete && (
                    <div style={{
                        padding: '16px',
                        background: '#374151',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => {
                                generateDebateSummaryWithData(debateSegments);
                                setAnalysisComplete(true);
                            }}
                            style={{
                                padding: '8px 16px',
                                background: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Generate Summary
                        </button>
                    </div>
                )}

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #374151',
                        boxShadow: '0 4px 20px rgba(31, 41, 55, 0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <TrendingUp size={24} color="#eab308" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Debate Momentum</h3>
                            <div style={{
                                marginLeft: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    marginLeft: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    {!analysisComplete && (
                                        <div style={{
                                            padding: '6px 16px',
                                            borderRadius: '12px',
                                            background: isDemocratLeading
                                                ? `linear-gradient(135deg, ${PARTY_COLORS.democrat}, ${PARTY_COLORS.democratLight})`
                                                : `linear-gradient(135deg, ${PARTY_COLORS.republican}, ${PARTY_COLORS.republicanLight})`,
                                            color: '#ffffff',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            boxShadow: isDemocratLeading
                                                ? '0 4px 12px rgba(59, 130, 246, 0.4)'
                                                : '0 4px 12px rgba(220, 38, 38, 0.4)'
                                        }}>
                                            {isDemocratLeading ? candidateScores.democrat.name : candidateScores.republican.name} Leading
                                        </div>
                                    )}
                                    {analysisComplete && (
                                        <button
                                            onClick={() => setIsGraphExpanded(true)}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                                color: '#ffffff',
                                                border: '2px solid #60a5fa',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.95rem',
                                                fontWeight: '700',
                                                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                                                transition: 'all 0.2s',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.transform = 'scale(1.05)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.6)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.transform = 'scale(1)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                                            }}
                                        >
                                            Expand Graph
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            height: '320px',
                            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                            borderRadius: '12px',
                            padding: '16px',
                            position: 'relative',
                            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)'
                        }}>
                            {momentumData.length > 0 ? (
                                <div style={{ height: '100%', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={momentumData}
                                            margin={{ top: 22, right: 20, left: 20, bottom: 40 }}
                                        >
                                            <defs>
                                                <linearGradient id="splitGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={PARTY_COLORS.democrat} stopOpacity={0.8} />
                                                    <stop offset="50%" stopColor={PARTY_COLORS.democrat} stopOpacity={0.1} />
                                                    <stop offset="50%" stopColor={PARTY_COLORS.republican} stopOpacity={0.1} />
                                                    <stop offset="100%" stopColor={PARTY_COLORS.republican} stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>

                                            <XAxis dataKey="segment" hide />
                                            <YAxis
                                                domain={[-5, 5]}
                                                ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />

                                            <Area
                                                type="monotone"
                                                dataKey={(data) => data.momentum > 0 ? data.momentum : 0}
                                                stroke={PARTY_COLORS.democrat}
                                                fill={PARTY_COLORS.democrat}
                                                fillOpacity={0.3}
                                                strokeWidth={3}
                                                dot={false}
                                                connectNulls={false}
                                            />

                                            {/* Area for negative (red) */}
                                            <Area
                                                type="monotone"
                                                dataKey={(data) => data.momentum < 0 ? data.momentum : 0}
                                                stroke={PARTY_COLORS.republican}
                                                fill={PARTY_COLORS.republican}
                                                fillOpacity={0.3}
                                                strokeWidth={3}
                                                dot={false}
                                                connectNulls={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>

                                    <div style={{
                                        position: 'absolute',
                                        bottom: '200px',
                                        left: '20px',
                                        right: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.75rem',
                                        color: '#666'
                                    }}>
                                        <span>DEM</span>
                                    </div>

                                    <div style={{
                                        position: 'absolute',
                                        bottom: '90px',
                                        left: '20px',
                                        right: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.75rem',
                                        color: '#666'
                                    }}>
                                        <span>REP</span>
                                    </div>


                                    <div style={{
                                        position: 'absolute',
                                        bottom: '5px',
                                        left: '55px',
                                        right: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.75rem',
                                        color: '#666'
                                    }}>
                                        <span>Start</span>
                                        <span>Mid-Debate</span>
                                        <span>End</span>
                                    </div>

                                    <div style={{
                                        position: 'absolute',
                                        top: '47%',
                                        left: '80px',
                                        right: '19px',
                                        height: '4px',
                                        backgroundColor: '#4b5563',
                                        transform: 'translateY(-50%)',
                                        zIndex: 1
                                    }}></div>
                                </div>
                            ) : (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6b7280',
                                    textAlign: 'center'
                                }}>
                                    <div>
                                        <BarChart3 size={48} color="#374151" style={{ margin: '0 auto 16px' }} />
                                        <p style={{ fontSize: '1rem', margin: '0 0 8px 0' }}>Ready for Analysis</p>
                                        <p style={{ fontSize: '0.875rem', margin: '0' }}>Select a debate to begin</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Scores */}
                    <div style={{
                        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(31, 41, 55, 0.4)'
                    }}>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <ChartArea size={24} color="blue" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                Performance Scores
                            </h3>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
                            border: '2px solid #3b82f6',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#9ca3af',
                                    marginBottom: '4px'
                                }}>
                                    Democrat
                                </div>
                                <div style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    color: '#ffffff'
                                }}>
                                    {candidateScores.democrat.name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '1.75rem',
                                    fontWeight: '700',
                                    color: '#3b82f6',
                                    lineHeight: '1'
                                }}>
                                    {candidateScores.democrat.score.toFixed(1)}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    marginTop: '2px'
                                }}>
                                    {candidateScores.democrat.segments} segments
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #5f1e1e 0%, #1e293b 100%)',
                            border: '2px solid #dc2626',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#9ca3af',
                                    marginBottom: '4px'
                                }}>
                                    Republican
                                </div>
                                <div style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    color: '#ffffff'
                                }}>
                                    {candidateScores.republican.name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '1.75rem',
                                    fontWeight: '700',
                                    color: '#dc2626',
                                    lineHeight: '1'
                                }}>
                                    {candidateScores.republican.score.toFixed(1)}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    marginTop: '2px'
                                }}>
                                    {candidateScores.republican.segments} segments
                                </div>
                            </div>
                        </div>

                        <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#ffffff',
                            margin: '0 0 12px 0'
                        }}>
                            Analysis Progress
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(31, 41, 55, 0.3)'
                            }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#3b82f6',
                                    lineHeight: '1'
                                }}>
                                    {debateSegments.length}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#9ca3af',
                                    marginTop: '4px'
                                }}>
                                    Segments
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(31, 41, 55, 0.3)'
                            }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#22c55e',
                                    lineHeight: '1'
                                }}>
                                    {formatTime(currentTime)}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#9ca3af',
                                    marginTop: '4px'
                                }}>
                                    Duration
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debate Summary */}
                {analysisComplete && debateSummary && (
                    <div style={{
                        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                        border: '1px solid #374151',
                        borderRadius: '16px',
                        padding: '32px',
                        marginTop: '24px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                    }}>
                        {/* Winner Banner */}
                        <div style={{
                            background: `linear-gradient(135deg, ${winner?.color || '#374151'}25, ${winner?.color || '#374151'}10)`,
                            border: `2px solid ${winner?.color || '#374151'}`,
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '32px',
                            textAlign: 'center',
                            boxShadow: `0 4px 20px ${winner?.color || '#374151'}40`
                        }}>
                            <Trophy size={48} color={winner?.color || '#eab308'} style={{ margin: '0 auto 16px' }} />
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: winner?.color || '#ffffff',
                                margin: '0 0 8px 0',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}>
                                {winner?.party || debateSummary.winner} WINS
                            </h2>
                            <p style={{
                                fontSize: '1.125rem',
                                color: '#e2e8f0',
                                margin: '0',
                                fontWeight: '500'
                            }}>
                                Victory Margin: {Math.abs(candidateScores.democrat.score - candidateScores.republican.score).toFixed(1)} points
                            </p>
                        </div>

                        {/* Top 3 Turning Points, Split into Positive and Negative */}
                        <div>
                            <h4 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#ffffff',
                                margin: '0 0 20px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Activity size={20} color="#eab308" />
                                Top Impactful Moments
                            </h4>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '24px'
                            }}>
                                {/* Top 3 Positive Moments */}
                                <div>
                                    <h5 style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#22c55e',
                                        margin: '0 0 16px 0',
                                        textAlign: 'center'
                                    }}>
                                        Top 3 Highest Scoring Moments
                                    </h5>
                                    {analyzedTranscriptLines
                                        .filter(line => line.impactScore > 0 && !line.isModerator)
                                        .sort((a, b) => b.impactScore - a.impactScore)
                                        .slice(0, 3)
                                        .map((line, index) => (
                                            <div key={index} style={{
                                                padding: '20px',
                                                background: index === 0 ? 'linear-gradient(135deg, #1a1506 0%, #3d2a0f 100%)' :
                                                    index === 1 ? 'linear-gradient(135deg, #1a1a1c 0%, #2d2d2f 100%)' :
                                                        'linear-gradient(135deg, #1a0f0a 0%, #3d2315 100%)',
                                                border: index === 0 ? '2px solid #FFD700' :
                                                    index === 1 ? '2px solid #C0C0C0' :
                                                        '2px solid #CD7F32',
                                                borderRadius: '12px',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                boxShadow: index === 0 ? '0 4px 20px rgba(255, 215, 0, 0.3)' :
                                                    index === 1 ? '0 4px 20px rgba(192, 192, 192, 0.3)' :
                                                        '0 4px 20px rgba(205, 127, 50, 0.3)',
                                                marginBottom: '16px'
                                            }}
                                                 onClick={() => setExpandedTurningPoints(prev => ({
                                                     ...prev,
                                                     [`pos-${index}`]: !prev[`pos-${index}`]
                                                 }))}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-18px',
                                                    right: '20px',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                                        index === 1 ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' :
                                                            'linear-gradient(135deg, #CD7F32, #8B4513)',
                                                    color: '#000000',
                                                    fontSize: '1.25rem',
                                                    fontWeight: '800',
                                                    borderRadius: '50%',
                                                    border: '3px solid #111827',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                                                    zIndex: 10
                                                }}>
                                                    {index + 1}
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '12px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: line.isDemocrat ? '#60a5fa' : '#f87171'
                                }}>
                                    {line.speaker}
                                </span>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '3px 6px',
                                                            background: '#374151',
                                                            color: '#9ca3af',
                                                            borderRadius: '4px',
                                                            fontWeight: '500'
                                                        }}>
                                    Line #{line.segmentNumber}
                                </span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: '800',
                                                        color: '#22c55e'
                                                    }}>
                                +{line.impactScore.toFixed(1)}
                            </span>
                                                </div>

                                                {line.text && (
                                                    <div style={{
                                                        padding: '12px',
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                                    }}>
                                                        <p style={{
                                                            color: '#ffffff',
                                                            margin: '0',
                                                            fontSize: '0.85rem',
                                                            lineHeight: '1.5',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            "{expandedTurningPoints[`pos-${index}`] ? line.text : line.text.substring(0, 60) + '...'}"
                                                        </p>
                                                        <div style={{
                                                            marginTop: '6px',
                                                            fontSize: '0.7rem',
                                                            color: '#60a5fa',
                                                            textAlign: 'right',
                                                            fontWeight: '500'
                                                        }}>
                                                            {expandedTurningPoints[`pos-${index}`] ? '▲ Click to collapse' : '▼ Click to expand'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>

                                {/* Top 3 Negative Moments */}
                                <div>
                                    <h5 style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#ef4444',
                                        margin: '0 0 16px 0',
                                        textAlign: 'center'
                                    }}>
                                        Top 3 Lowest Scoring Moments
                                    </h5>
                                    {analyzedTranscriptLines
                                        .filter(line => line.impactScore < 0 && !line.isModerator)
                                        .sort((a, b) => a.impactScore - b.impactScore)
                                        .slice(0, 3)
                                        .map((line, index) => (
                                            <div key={index} style={{
                                                padding: '20px',
                                                background: index === 0 ? 'linear-gradient(135deg, #1a1506 0%, #3d2a0f 100%)' :
                                                    index === 1 ? 'linear-gradient(135deg, #1a1a1c 0%, #2d2d2f 100%)' :
                                                        'linear-gradient(135deg, #1a0f0a 0%, #3d2315 100%)',
                                                border: index === 0 ? '2px solid #FFD700' :
                                                    index === 1 ? '2px solid #C0C0C0' :
                                                        '2px solid #CD7F32',
                                                borderRadius: '12px',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                boxShadow: index === 0 ? '0 4px 20px rgba(255, 215, 0, 0.3)' :
                                                    index === 1 ? '0 4px 20px rgba(192, 192, 192, 0.3)' :
                                                        '0 4px 20px rgba(205, 127, 50, 0.3)',
                                                marginBottom: '16px'
                                            }}
                                                 onClick={() => setExpandedTurningPoints(prev => ({
                                                     ...prev,
                                                     [`neg-${index}`]: !prev[`neg-${index}`]
                                                 }))}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-18px',
                                                    right: '20px',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                                        index === 1 ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' :
                                                            'linear-gradient(135deg, #CD7F32, #8B4513)',
                                                    color: '#000000',
                                                    fontSize: '1.25rem',
                                                    fontWeight: '800',
                                                    borderRadius: '50%',
                                                    border: '3px solid #111827',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                                                    zIndex: 10
                                                }}>
                                                    {index + 1}
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '12px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: line.isDemocrat ? '#60a5fa' : '#f87171'
                                }}>
                                    {line.speaker}
                                </span>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '3px 6px',
                                                            background: '#374151',
                                                            color: '#9ca3af',
                                                            borderRadius: '4px',
                                                            fontWeight: '500'
                                                        }}>
                                    Line #{line.segmentNumber}
                                </span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: '800',
                                                        color: '#ef4444'
                                                    }}>
                                {line.impactScore.toFixed(1)}
                            </span>
                                                </div>

                                                {line.text && (
                                                    <div style={{
                                                        padding: '12px',
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                                    }}>
                                                        <p style={{
                                                            color: '#ffffff',
                                                            margin: '0',
                                                            fontSize: '0.85rem',
                                                            lineHeight: '1.5',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            "{expandedTurningPoints[`neg-${index}`] ? line.text : line.text.substring(0, 60) + '...'}"
                                                        </p>
                                                        <div style={{
                                                            marginTop: '6px',
                                                            fontSize: '0.7rem',
                                                            color: '#60a5fa',
                                                            textAlign: 'right',
                                                            fontWeight: '500'
                                                        }}>
                                                            {expandedTurningPoints[`neg-${index}`] ? '▲ Click to collapse' : '▼ Click to expand'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Live Analysis and Debate Fact */}
                {!analysisComplete ? (
                    <div style={{
                        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        padding: '24px',
                        marginTop: '16px',
                        boxShadow: '0 4px 20px rgba(31, 41, 55, 0.4)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#ffffff',
                                margin: '0'
                            }}>
                                Live Analysis
                            </h3>
                            {parsedSegments.length > 0 && (
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>
                                    {currentSegmentIndex + 1} of {parsedSegments.length}
                                </div>
                            )}
                        </div>

                        {/* Current segment being analyzed */}
                        {currentSegmentIndex >= 0 && parsedSegments[currentSegmentIndex] && (
                            <div style={{
                                padding: '20px',
                                background: parsedSegments[currentSegmentIndex].isModerator ? '#374151' : '#1e40af',
                                border: parsedSegments[currentSegmentIndex].isModerator ? '1px solid #6b7280' : '1px solid #3b82f6',
                                borderRadius: '8px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: parsedSegments[currentSegmentIndex].isModerator ? '#9ca3af' :
                                                isDemocratCandidate(parsedSegments[currentSegmentIndex].speaker) ? '#60a5fa' : '#f87171'
                                        }}></div>
                                        <span style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: '#ffffff'
                                        }}>
                            {parsedSegments[currentSegmentIndex].speaker}
                        </span>
                                        {parsedSegments[currentSegmentIndex].isModerator && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                background: '#6b7280',
                                                color: '#ffffff',
                                                borderRadius: '4px',
                                                fontWeight: '500'
                                            }}>
                                QUESTION
                            </span>
                                        )}
                                    </div>
                                    {liveAnalysis && !parsedSegments[currentSegmentIndex].isModerator && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: liveAnalysis.sentiment?.sentiment === 'POSITIVE' ?
                                    '#065f46' :
                                    liveAnalysis.sentiment?.sentiment === 'NEGATIVE' ?
                                        '#991b1b' : '#374151',
                                color: '#ffffff',
                                fontWeight: '500'
                            }}>
                                {liveAnalysis.sentiment?.sentiment}
                            </span>
                                            <span style={{
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: liveAnalysis.segment?.impact_score > 0 ? '#22c55e' :
                                                    liveAnalysis.segment?.impact_score < 0 ? '#ef4444' : '#9ca3af'
                                            }}>
                                {liveAnalysis.segment?.impact_score > 0 ? '+' : ''}{liveAnalysis.segment?.impact_score?.toFixed(1)}
                            </span>
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    padding: '16px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    <p style={{
                                        color: '#ffffff',
                                        margin: '0',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        fontStyle: 'italic'
                                    }}>
                                        "{parsedSegments[currentSegmentIndex].text}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {!parsedSegments.length && (
                            <div style={{
                                padding: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6b7280',
                                textAlign: 'center',
                                background: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <Activity size={48} color="#374151" style={{ margin: '0 auto 16px' }} />
                                    <p style={{ fontSize: '1rem', margin: '0 0 8px 0' }}>Waiting for Analysis</p>
                                    <p style={{ fontSize: '0.875rem', margin: '0' }}>Select a debate to see live analysis</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Debate Fact
                    <div style={{
                    background: 'linear-gradient(135deg, #1e1b3d 0%, #2d1b69 100%)',
                    border: '2px solid #8b5cf6',
                    borderRadius: '12px',
                    padding: '24px',
                    marginTop: '16px',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <span style={{ fontSize: '2rem' }}>💡</span>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#a78bfa',
                        margin: '0'
                    }}>
                        Debate Fact
                    </h3>
                </div>
                <p style={{
                    color: '#e2e8f0',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    margin: '0'
                }}>
                    {getDebateFact(selectedDebate)}
                </p>
            </div>
            )}

                {/* Full Transcript */}
                {analyzedTranscriptLines.length > 0 && (
                    <div key={selectedDebate?.id} style={{
                        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        padding: '24px',
                        marginTop: '24px',
                        boxShadow: '0 4px 20px rgba(31, 41, 55, 0.4)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#ffffff',
                                margin: '0'
                            }}>
                                Full Transcript
                            </h3>
                            <div style={{
                                fontSize: '0.8rem',
                                color: '#6b7280',
                                fontWeight: '500'
                            }}>
                                {analyzedTranscriptLines.length} lines analyzed
                            </div>
                        </div>

                        <button
                            onClick={() => setShowFullTranscript(!showFullTranscript)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'linear-gradient(135deg, #1f2937, #111827)',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#ffffff',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s',
                                marginBottom: '16px',
                                boxShadow: '0 2px 8px rgba(31, 41, 55, 0.3)'
                            }}
                        >
                            <span>{showFullTranscript ? 'Hide' : 'Show'} Complete Transcript</span>
                            <span style={{
                                transform: showFullTranscript ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}>
                ▼
            </span>
                        </button>

                        {showFullTranscript && (
                            <>
                                {/* Search Bar */}
                                <div style={{
                                    marginBottom: '16px',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                                    borderRadius: '8px',
                                    border: '1px solid #374151',
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Search transcript for keywords..."
                                        value={transcriptSearchQuery}
                                        onChange={(e) => setTranscriptSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: '#111827',
                                            border: '1px solid #374151',
                                            borderRadius: '6px',
                                            color: '#ffffff',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#374151'}
                                    />
                                    {transcriptSearchQuery && (
                                        <div style={{
                                            marginTop: '8px',
                                            fontSize: '0.8rem',
                                            color: '#9ca3af'
                                        }}>
                                            Found {analyzedTranscriptLines.filter(line =>
                                            line.text?.toLowerCase().includes(transcriptSearchQuery.toLowerCase()) ||
                                            line.speaker?.toLowerCase().includes(transcriptSearchQuery.toLowerCase())
                                        ).length} results
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    maxHeight: '600px',
                                    overflowY: 'auto',
                                    background: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '8px',
                                    padding: '16px'
                                }}>
                                    {analyzedTranscriptLines
                                        .filter(line => !transcriptSearchQuery ||
                                            line.text?.toLowerCase().includes(transcriptSearchQuery.toLowerCase()) ||
                                            line.speaker?.toLowerCase().includes(transcriptSearchQuery.toLowerCase())
                                        )
                                        .map((line, index) => (
                                            <div key={index} style={{
                                                padding: '12px',
                                                background: line.isModerator
                                                    ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
                                                    : (line.isDemocrat
                                                        ? 'linear-gradient(135deg, #1e3a5f 0%, #0f1e3a 100%)'
                                                        : 'linear-gradient(135deg, #5f1e1e 0%, #3a0f0f 100%)'),
                                                border: `2px solid ${line.isModerator ? '#6b7280' : (line.isDemocrat ? '#2563eb' : '#dc2626')}`,
                                                borderRadius: '6px',
                                                marginBottom: '12px',
                                                boxShadow: line.isModerator
                                                    ? '0 2px 8px rgba(55, 65, 81, 0.3)'
                                                    : (line.isDemocrat
                                                        ? '0 2px 8px rgba(37, 99, 235, 0.3)'
                                                        : '0 2px 8px rgba(220, 38, 38, 0.3)')
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '8px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 6px',
                                        background: '#374151',
                                        color: '#9ca3af',
                                        borderRadius: '4px'
                                    }}>
                                        #{line.segmentNumber}
                                    </span>
                                                        <span style={{
                                                            fontSize: '0.95rem',
                                                            fontWeight: '600',
                                                            color: '#ffffff'
                                                        }}>
                                        {line.speaker}
                                    </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: line.sentiment === 'POSITIVE' ? '#065f46' :
                                            line.sentiment === 'NEGATIVE' ? '#991b1b' : '#374151',
                                        color: '#ffffff',
                                        fontWeight: '500'
                                    }}>
                                        {line.sentiment}
                                    </span>
                                                        <span style={{
                                                            fontSize: '0.95rem',
                                                            fontWeight: '700',
                                                            color: line.impactScore > 0 ? '#22c55e' :
                                                                line.impactScore < 0 ? '#ef4444' : '#9ca3af'
                                                        }}>
                                        {line.impactScore > 0 ? '+' : ''}{line.impactScore.toFixed(1)}
                                    </span>
                                                    </div>
                                                </div>
                                                <p style={{
                                                    color: '#e2e8f0',
                                                    margin: '0',
                                                    fontSize: '0.875rem',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {line.text}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
            {/* Fullscreen Graph */}
            {isGraphExpanded && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '40px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#ffffff',
                            margin: 0
                        }}>
                            Debate Momentum Analysis
                        </h2>
                        <button
                            onClick={() => setIsGraphExpanded(false)}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                color: '#ffffff',
                                border: '2px solid #f87171',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '700',
                                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5)',
                                transition: 'all 0.2s',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.5)';
                            }}
                        >
                            ✕ Close
                        </button>
                    </div>

                    <div style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                        borderRadius: '12px',
                        padding: '32px',
                        position: 'relative',
                        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)'
                    }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={momentumData}
                                margin={{ top: 40, right: 40, left: 40, bottom: 60 }}
                            >
                                <XAxis dataKey="segment" hide />
                                <YAxis
                                    domain={[-5, 5]}
                                    ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 14 }}
                                />
                                <Tooltip content={<CustomTooltip />} />

                                <Area
                                    type="monotone"
                                    dataKey={(data) => data.momentum > 0 ? data.momentum : 0}
                                    stroke={PARTY_COLORS.democrat}
                                    fill={PARTY_COLORS.democrat}
                                    fillOpacity={0.3}
                                    strokeWidth={4}
                                    dot={false}
                                    connectNulls={false}
                                />

                                <Area
                                    type="monotone"
                                    dataKey={(data) => data.momentum < 0 ? data.momentum : 0}
                                    stroke={PARTY_COLORS.republican}
                                    fill={PARTY_COLORS.republican}
                                    fillOpacity={0.3}
                                    strokeWidth={4}
                                    dot={false}
                                    connectNulls={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>

                        <div style={{
                            position: 'absolute',
                            top: '49%',
                            left: '80px',
                            right: '40px',
                            height: '7px',
                            backgroundColor: '#4b5563',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                        }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default App;