import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
    Video,
    TrendingUp,
    Activity,
    BarChart3,
    Crown,
    Trophy,
    Play,
    Pause,
    SkipForward,
    ChartArea,
    RadioIcon
} from 'lucide-react';

const App = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [liveAnalysis, setLiveAnalysis] = useState(null);
    const [debateSegments, setDebateSegments] = useState([]);
    const [selectedDebate, setSelectedDebate] = useState(null);
    const [selectedYear, setSelectedYear] = useState('2024');
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

    // New state for enhanced features
    const [analysisSpeed, setAnalysisSpeed] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [debateSummary, setDebateSummary] = useState(null);
    const [turningPoints, setTurningPoints] = useState([]);

    const PARTY_COLORS = {
        democrat: '#3b82f6',
        republican: '#dc2626',
        democratLight: '#60a5fa',
        republicanLight: '#f87171'
    };

    const PRESIDENTIAL_DEBATES = {
        2024: [
            {
                id: '2024_debate_1',
                title: 'Biden vs Trump - June 27, 2024',
                date: 'June 27, 2024',
                location: 'CNN Studios, Atlanta',
                candidates: { dem: 'Joe Biden', rep: 'Donald Trump' },
                topics: ['economy', 'immigration', 'abortion', 'foreign_policy']
            },
            {
                id: '2024_debate_2',
                title: 'Harris vs Trump - September 10, 2024',
                date: 'September 10, 2024',
                location: 'Philadelphia, PA',
                candidates: { dem: 'Kamala Harris', rep: 'Donald Trump' },
                topics: ['economy', 'immigration', 'abortion', 'foreign_policy']
            }
        ],
        2020: [
            {
                id: '2020_debate_1',
                title: 'Biden vs Trump - September 29, 2020',
                date: 'September 29, 2020',
                location: 'Case Western Reserve University, Cleveland, OH',
                candidates: { dem: 'Joe Biden', rep: 'Donald Trump' },
                topics: ['covid', 'economy', 'healthcare', 'race', 'climate']
            },
            {
                id: '2020_debate_2',
                title: 'Biden vs Trump - October 22, 2020',
                date: 'October 22, 2020',
                location: 'Belmont University, Nashville, TN',
                candidates: { dem: 'Joe Biden', rep: 'Donald Trump' },
                topics: ['covid', 'healthcare', 'economy', 'climate', 'race']
            }
        ],
        2016: [
            {
                id: '2016_debate_1',
                title: 'Clinton vs Trump - September 26, 2016',
                date: 'September 26, 2016',
                location: 'Hofstra University, Hempstead, NY',
                candidates: { dem: 'Hillary Clinton', rep: 'Donald Trump' },
                topics: ['economy', 'security', 'race', 'experience']
            },
            {
                id: '2016_debate_2',
                title: 'Clinton vs Trump - October 9, 2016',
                date: 'October 9, 2016',
                location: 'Washington University, St. Louis, MO',
                candidates: { dem: 'Hillary Clinton', rep: 'Donald Trump' },
                topics: ['healthcare', 'taxes', 'islamophobia', 'emails']
            },
            {
                id: '2016_debate_3',
                title: 'Clinton vs Trump - October 19, 2016',
                date: 'October 19, 2016',
                location: 'University of Nevada, Las Vegas, NV',
                candidates: { dem: 'Hillary Clinton', rep: 'Donald Trump' },
                topics: ['immigration', 'economy', 'foreign_policy', 'fitness']
            }
        ],
        2012: [
            {
                id: '2012_debate_1',
                title: 'Obama vs Romney - October 3, 2012',
                date: 'October 3, 2012',
                location: 'University of Denver, Denver, CO',
                candidates: { dem: 'Barack Obama', rep: 'Mitt Romney' },
                topics: ['economy', 'healthcare', 'taxes', 'regulation']
            },
            {
                id: '2012_debate_2',
                title: 'Obama vs Romney - October 16, 2012',
                date: 'October 16, 2012',
                location: 'Hofstra University, Hempstead, NY',
                candidates: { dem: 'Barack Obama', rep: 'Mitt Romney' },
                topics: ['economy', 'energy', 'immigration', 'libya']
            },
            {
                id: '2012_debate_3',
                title: 'Obama vs Romney - October 22, 2012',
                date: 'October 22, 2012',
                location: 'Lynn University, Boca Raton, FL',
                candidates: { dem: 'Barack Obama', rep: 'Mitt Romney' },
                topics: ['foreign_policy', 'military', 'china', 'middle_east']
            }
        ],
        2008: [
            {
                id: '2008_debate_1',
                title: 'Obama vs McCain - September 26, 2008',
                date: 'September 26, 2008',
                location: 'University of Mississippi, Oxford, MS',
                candidates: { dem: 'Barack Obama', rep: 'John McCain' },
                topics: ['financial_crisis', 'foreign_policy', 'iraq', 'economy']
            },
            {
                id: '2008_debate_2',
                title: 'Obama vs McCain - October 7, 2008',
                date: 'October 7, 2008',
                location: 'Belmont University, Nashville, TN',
                candidates: { dem: 'Barack Obama', rep: 'John McCain' },
                topics: ['healthcare', 'economy', 'energy', 'foreign_policy']
            },
            {
                id: '2008_debate_3',
                title: 'Obama vs McCain - October 15, 2008',
                date: 'October 15, 2008',
                location: 'Hofstra University, Hempstead, NY',
                candidates: { dem: 'Barack Obama', rep: 'John McCain' },
                topics: ['economy', 'healthcare', 'education', 'ayers']
            }
        ],
        2004: [
            {
                id: '2004_debate_1',
                title: 'Kerry vs Bush - September 30, 2004',
                date: 'September 30, 2004',
                location: 'University of Miami, Coral Gables, FL',
                candidates: { dem: 'John Kerry', rep: 'George W. Bush' },
                topics: ['iraq', 'terrorism', 'homeland_security', 'foreign_policy']
            },
            {
                id: '2004_debate_2',
                title: 'Kerry vs Bush - October 8, 2004',
                date: 'October 8, 2004',
                location: 'Washington University, St. Louis, MO',
                candidates: { dem: 'John Kerry', rep: 'George W. Bush' },
                topics: ['healthcare', 'economy', 'taxes', 'social_security']
            },
            {
                id: '2004_debate_3',
                title: 'Kerry vs Bush - October 13, 2004',
                date: 'October 13, 2004',
                location: 'Arizona State University, Tempe, AZ',
                candidates: { dem: 'John Kerry', rep: 'George W. Bush' },
                topics: ['domestic_policy', 'abortion', 'gay_marriage', 'healthcare']
            }
        ],
        2000: [
            {
                id: '2000_debate_1',
                title: 'Gore vs Bush - October 3, 2000',
                date: 'October 3, 2000',
                location: 'University of Massachusetts, Boston, MA',
                candidates: { dem: 'Al Gore', rep: 'George W. Bush' },
                topics: ['budget', 'social_security', 'healthcare', 'education']
            },
            {
                id: '2000_debate_2',
                title: 'Gore vs Bush - October 11, 2000',
                date: 'October 11, 2000',
                location: 'Wake Forest University, Winston-Salem, NC',
                candidates: { dem: 'Al Gore', rep: 'George W. Bush' },
                topics: ['healthcare', 'education', 'social_security', 'taxes']
            },
            {
                id: '2000_debate_3',
                title: 'Gore vs Bush - October 17, 2000',
                date: 'October 17, 2000',
                location: 'Washington University, St. Louis, MO',
                candidates: { dem: 'Al Gore', rep: 'George W. Bush' },
                topics: ['foreign_policy', 'military', 'campaign_finance', 'energy']
            }
        ]
    };

    const calculateImpactScore = (segment, sentimentData) => {
        let baseScore = 0;

        if (sentimentData.sentiment === 'POSITIVE') {
            baseScore = sentimentData.confidence * 3;
        } else if (sentimentData.sentiment === 'NEGATIVE') {
            baseScore = -(sentimentData.confidence * 3);
        }

        const topicMultipliers = {
            'economy': 1.5,
            'healthcare': 1.4,
            'democracy': 1.6,
            'foreign_policy': 1.3,
            'immigration': 1.4,
            'covid': 1.5,
            'climate': 1.2
        };

        const multiplier = topicMultipliers[segment.topic] || 1.0;
        const rhetoricalBonus = (Math.random() - 0.5) * 2;
        const finalScore = Math.max(-5, Math.min(5, (baseScore * multiplier) + rhetoricalBonus));
        return Math.round(finalScore * 10) / 10;
    };

    const generateSentimentAnalysis = (segment) => {
        const text = segment.text.toLowerCase();

        const positiveWords = ['success', 'achieve', 'better', 'improve', 'strong', 'great', 'progress', 'opportunity'];
        const negativeWords = ['fail', 'disaster', 'wrong', 'terrible', 'crisis', 'problem', 'threat', 'dangerous'];

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

    const isDemocratCandidate = (speaker) => {
        const democratNames = ['harris', 'biden', 'obama', 'clinton', 'gore', 'kerry'];
        const speakerLower = speaker.toLowerCase();
        return democratNames.some(name => speakerLower.includes(name));
    };

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
        } finally {
            setIsLoadingTranscript(false);
        }
    };

    const analyzeTranscriptInChunks = (transcriptText, debate) => {
        const segments = parseTranscriptIntoSegments(transcriptText, debate);

        if (segments.length === 0) {
            setTranscriptError('No valid segments found in transcript');
            setIsAnalyzing(false);
            return;
        }

        setParsedSegments(segments);

        let currentIndex = 0;
        const baseDelay = 3000; // Base delay in milliseconds
        let intervalId;

        const processNextChunk = () => {
            if (isPaused) return;

            if (currentIndex < segments.length) {
                const segment = segments[currentIndex];
                setCurrentSegmentIndex(currentIndex);

                if (!segment.isModerator) {
                    const sentimentData = generateSentimentAnalysis(segment);
                    const impactScore = calculateImpactScore(segment, sentimentData);

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

                    setLiveAnalysis(analysisData);
                    setCurrentTime(analysisData.timestamp);
                    setDebateSegments(prev => [...prev, analysisData]);

                    const party = isDemocratCandidate(segment.speaker) ? 'democrat' : 'republican';
                    setCandidateScores(prev => ({
                        ...prev,
                        [party]: {
                            ...prev[party],
                            score: prev[party].score + impactScore,
                            segments: prev[party].segments + 1
                        }
                    }));
                }

                currentIndex++;

                if (currentIndex < segments.length) {
                    intervalId = setTimeout(processNextChunk, baseDelay / analysisSpeed);
                } else {
                    // Analysis complete - generate summary
                    generateDebateSummary();
                    setCurrentSegmentIndex(-1);
                    setIsAnalyzing(false);
                    setAnalysisComplete(true);
                }
            }
        };

        setTimeout(() => {
            processNextChunk();
        }, 1000);

        return () => {
            if (intervalId) clearTimeout(intervalId);
        };
    };

    const parseTranscriptIntoSegments = (transcriptText, debate) => {
        const segments = [];
        const lines = transcriptText.split('\n');
        let currentSpeaker = '';
        let currentText = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Updated regex to match actual candidate names from your transcripts
            const speakerMatch = line.match(/^(GORE|BUSH|BIDEN|TRUMP|HARRIS|CLINTON|OBAMA|ROMNEY|MCCAIN|KERRY|MODERATOR):\s*(.*)/);

            if (speakerMatch) {
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

        // Add final segment
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

    const mapSpeakerToCandidate = (speaker, debate) => {
        // Map speaker labels to actual candidate names from the debate object
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
            'MODERATOR': 'MODERATOR'
        };

        return speakerMap[speaker] || speaker;
    };

    const extractTopicFromText = (text) => {
        const topicKeywords = {
            economy: ['economy', 'jobs', 'unemployment', 'business'],
            healthcare: ['healthcare', 'health', 'medical', 'insurance'],
            foreign_policy: ['foreign', 'international', 'war', 'military'],
            immigration: ['immigration', 'border', 'immigrant'],
            climate: ['climate', 'environment', 'energy']
        };

        const textLower = text.toLowerCase();
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                return topic;
            }
        }
        return 'general';
    };

    const generateDebateSummary = () => {
        const momentumData = createMomentumData();
        const turningPointsData = findTurningPoints(momentumData);

        // Calculate winner based on final score
        const winner = candidateScores.democrat.score > candidateScores.republican.score
            ? candidateScores.democrat.name
            : candidateScores.republican.name;

        // Calculate time-weighted momentum (how long each candidate led)
        let democratLeadingTime = 0;
        let republicanLeadingTime = 0;

        momentumData.forEach(() => {
            if (currentMomentum > 0) {
                democratLeadingTime += 30; // 30 seconds per segment
            } else if (currentMomentum < 0) {
                republicanLeadingTime += 30;
            }
        });

        // Find most impactful moment
        let mostImpactfulMoment = null;
        let highestImpact = 0;

        debateSegments.forEach((segment, index) => {
            const impact = Math.abs(segment.segment?.impact_score || 0);
            if (impact > highestImpact) {
                highestImpact = impact;
                mostImpactfulMoment = {
                    speaker: segment.segment?.speaker,
                    impact: segment.segment?.impact_score,
                    text: segment.segment?.text?.substring(0, 120) + '...',
                    segment: index + 1,
                    topic: segment.segment?.topic
                };
            }
        });

        const summary = {
            winner,
            totalSegments: debateSegments.length,
            avgDemocratScore: candidateScores.democrat.segments > 0 ?
                (candidateScores.democrat.score / candidateScores.democrat.segments).toFixed(2) : 0,
            avgRepublicanScore: candidateScores.republican.segments > 0 ?
                (candidateScores.republican.score / candidateScores.republican.segments).toFixed(2) : 0,
            keyMoments: turningPointsData.slice(0, 3),
            finalMomentum: momentumData.length > 0 ? momentumData[momentumData.length - 1].momentum : 0,
            // New stats
            democratLeadingTime: Math.round(democratLeadingTime / 60), // Convert to minutes
            republicanLeadingTime: Math.round(republicanLeadingTime / 60),
            totalMomentumDemocrat: candidateScores.democrat.score,
            totalMomentumRepublican: Math.abs(candidateScores.republican.score),
            mostImpactfulMoment
        };

        setDebateSummary(summary);
        setTurningPoints(turningPointsData);
    };

    const findTurningPoints = (data) => {
        const points = [];
        for (let i = 1; i < data.length - 1; i++) {
            const prev = data[i - 1].momentum;
            const curr = data[i].momentum;
            const next = data[i + 1].momentum;

            // Look for momentum shifts
            if ((prev < curr && curr > next) || (prev > curr && curr < next)) {
                points.push({
                    segment: i + 1,
                    momentum: curr,
                    description: `Major momentum shift at segment ${i + 1}`,
                    speaker: data[i].speaker
                });
            }
        }
        return points;
    };

    const startDebateAnalysis = async (debate) => {
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
        setCandidateScores({
            democrat: { name: debate.candidates.dem, score: 0, segments: 0 },
            republican: { name: debate.candidates.rep, score: 0, segments: 0 }
        });

        await fetchDebateTranscript(debate);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const skipForward = () => {
        if (currentSegmentIndex < parsedSegments.length - 1) {
            setCurrentSegmentIndex(currentSegmentIndex + 5);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    const getWinningCandidate = () => {
        if (candidateScores.democrat.score > candidateScores.republican.score) {
            return { party: candidateScores.democrat.name, color: PARTY_COLORS.democratLight };
        } else if (candidateScores.republican.score > candidateScores.democrat.score) {
            return { party: candidateScores.republican.name, color: PARTY_COLORS.republicanLight };
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
                background: '#111827',
                borderBottom: '1px solid #1f2937',
                padding: '16px 0'
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
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: '#ffffff',
                                margin: '0'
                            }}>
                                LockBox
                            </h1>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#9ca3af',
                                margin: '4px 0 0 0'
                            }}>
                                Enhanced real-time sentiment analysis of presidential debates
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
                    background: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px'
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
                                    border: selectedYear === year ? '1px solid #3b82f6' : '1px solid #374151',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    background: selectedYear === year ? '#1e40af' : '#1f2937',
                                    color: selectedYear === year ? '#ffffff' : '#9ca3af'
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
                                    background: selectedDebate?.id === debate.id ? '#1e40af' : '#1f2937',
                                    border: selectedDebate?.id === debate.id ? '1px solid #3b82f6' : '1px solid #374151',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
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
                        background: '#111827',
                        border: '1px solid #1f2937',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={togglePause}
                                style={{
                                    padding: '8px',
                                    background: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    color: '#ffffff'
                                }}
                            >
                                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                            <button
                                onClick={skipForward}
                                style={{
                                    padding: '8px',
                                    background: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    color: '#ffffff'
                                }}
                            >
                                <SkipForward size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Speed:</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[0.5, 1, 2, 4].map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => setAnalysisSpeed(speed)}
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
                            height: '4px',
                            background: '#374151',
                            borderRadius: '2px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${((currentSegmentIndex + 1) / parsedSegments.length) * 100}%`,
                                height: '100%',
                                background: '#3b82f6',
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                    </div>
                )}

                {/* Winner Display */}
                {winner && debateSegments.length > 2 && (
                    <div style={{
                        padding: '16px',
                        background: '#111827',
                        border: `1px solid ${winner.color}40`,
                        borderRadius: '8px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
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

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    {/* Enhanced Chart */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <TrendingUp size={24} color="#eab308" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Debate Momentum</h3>
                            <div style={{
                                marginLeft: 'auto',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                background: isDemocratLeading ? PARTY_COLORS.democrat + '20' : PARTY_COLORS.republican + '20',
                                color: isDemocratLeading ? PARTY_COLORS.democratLight : PARTY_COLORS.republicanLight,
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>
                                {isDemocratLeading ? candidateScores.democrat.name : candidateScores.republican.name} Leading
                            </div>
                        </div>

                        <div style={{
                            height: '320px',
                            background: '#1a1a1a',
                            borderRadius: '12px',
                            padding: '16px',
                            position: 'relative'
                        }}>
                            {momentumData.length > 0 ? (
                                <div style={{ height: '100%', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={momentumData}
                                            margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                                        >
                                            <defs>
                                                <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop
                                                        offset="5%"
                                                        stopColor={isDemocratLeading ? PARTY_COLORS.democrat : PARTY_COLORS.republican}
                                                        stopOpacity={0.8}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor={isDemocratLeading ? PARTY_COLORS.democrat : PARTY_COLORS.republican}
                                                        stopOpacity={0.1}
                                                    />
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
                                                dataKey="momentum"
                                                stroke={isDemocratLeading ? PARTY_COLORS.democrat : PARTY_COLORS.republican}
                                                fill="url(#momentumGradient)"
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6, stroke: isDemocratLeading ? PARTY_COLORS.democrat : PARTY_COLORS.republican, strokeWidth: 2, fill: '#ffffff' }}
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
                                        height: '2px',
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
                        background: '#111827',
                        border: '1px solid #1f2937',
                        borderRadius: '12px',
                        padding: '24px'
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
                            background: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            marginBottom: '12px'
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
                            background: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            marginBottom: '24px'
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
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px'
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
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px'
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
                        background: '#111827',
                        border: '1px solid #1f2937',
                        borderRadius: '12px',
                        padding: '24px',
                        marginTop: '24px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            <Trophy size={24} color="#eab308" />
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#ffffff',
                                margin: '0'
                            }}>
                                Debate Analysis Summary
                            </h3>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px',
                            marginBottom: '24px'
                        }}>
                            {/* Winner */}
                            <div style={{
                                padding: '20px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <Crown size={32} color="#eab308" style={{ margin: '0 auto 12px' }} />
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: '#eab308',
                                    marginBottom: '4px'
                                }}>
                                    Debate Winner
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#ffffff'
                                }}>
                                    {debateSummary.winner}
                                </div>
                            </div>

                            {/* Total Momentum - Democrat */}
                            <div style={{
                                padding: '20px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <TrendingUp size={32} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: '#3b82f6',
                                    marginBottom: '4px'
                                }}>
                                    Total Momentum (D)
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#ffffff'
                                }}>
                                    {debateSummary.totalMomentumDemocrat.toFixed(1)}
                                </div>
                            </div>

                            {/* Total Momentum - Republican */}
                            <div style={{
                                padding: '20px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <TrendingUp size={32} color="#dc2626" style={{ margin: '0 auto 12px' }} />
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: '#dc2626',
                                    marginBottom: '4px'
                                }}>
                                    Total Momentum (R)
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#ffffff'
                                }}>
                                    {debateSummary.totalMomentumRepublican.toFixed(1)}
                                </div>
                            </div>

                            {/* Time Leading - Democrat */}
                            <div style={{
                                padding: '20px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <Activity size={32} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: '#3b82f6',
                                    marginBottom: '4px'
                                }}>
                                    Time Leading (D)
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#ffffff'
                                }}>
                                    {debateSummary.democratLeadingTime}m
                                </div>
                            </div>

                            {/* Time Leading - Republican */}
                            <div style={{
                                padding: '20px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <Activity size={32} color="#dc2626" style={{ margin: '0 auto 12px' }} />
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: '#dc2626',
                                    marginBottom: '4px'
                                }}>
                                    Time Leading (R)
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#ffffff'
                                }}>
                                    {debateSummary.republicanLeadingTime}m
                                </div>
                            </div>

                            {/* Final Momentum */}
                            <div style={{
                                padding: '20px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <BarChart3 size={32} color={debateSummary.finalMomentum > 0 ? '#3b82f6' : '#dc2626'}
                                           style={{ margin: '0 auto 12px' }} />
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: debateSummary.finalMomentum > 0 ? '#3b82f6' : '#dc2626',
                                    marginBottom: '4px'
                                }}>
                                    Final Momentum
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#ffffff'
                                }}>
                                    {debateSummary.finalMomentum > 0 ? '+' : ''}{debateSummary.finalMomentum.toFixed(1)}
                                </div>
                            </div>
                        </div>

                        {/* Most Impactful Moment */}
                        {debateSummary.mostImpactfulMoment && (
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    margin: '0 0 16px 0'
                                }}>
                                    Most Impactful Moment
                                </h4>
                                <div style={{
                                    padding: '20px',
                                    background: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px'
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
                                                backgroundColor: isDemocratCandidate(debateSummary.mostImpactfulMoment.speaker) ? '#3b82f6' : '#dc2626'
                                            }}></div>
                                            <span style={{
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                color: '#ffffff'
                                            }}>
                                                {debateSummary.mostImpactfulMoment.speaker}
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                background: '#374151',
                                                color: '#9ca3af',
                                                borderRadius: '4px'
                                            }}>
                                                Segment {debateSummary.mostImpactfulMoment.segment}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '4px 8px',
                                                background: '#581c87',
                                                color: '#c4b5fd',
                                                borderRadius: '4px',
                                                fontWeight: '500'
                                            }}>
                                                {debateSummary.mostImpactfulMoment.topic?.replace('_', ' ')}
                                            </span>
                                            <span style={{
                                                fontSize: '1.125rem',
                                                fontWeight: '700',
                                                color: debateSummary.mostImpactfulMoment.impact > 0 ? '#22c55e' : '#ef4444'
                                            }}>
                                                {debateSummary.mostImpactfulMoment.impact > 0 ? '+' : ''}{debateSummary.mostImpactfulMoment.impact.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{
                                        color: '#e2e8f0',
                                        margin: '0',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.5',
                                        fontStyle: 'italic'
                                    }}>
                                        "{debateSummary.mostImpactfulMoment.text}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {turningPoints.length > 0 && (
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    margin: '0 0 16px 0'
                                }}>
                                    Key Turning Points
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '12px'
                                }}>
                                    {turningPoints.slice(0, 3).map((point, index) => (
                                        <div key={index} style={{
                                            padding: '16px',
                                            background: '#0f172a',
                                            border: '1px solid #1e293b',
                                            borderRadius: '6px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    color: '#ffffff'
                                                }}>
                                                    Segment {point.segment}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: '700',
                                                    color: point.momentum > 0 ? '#3b82f6' : '#dc2626'
                                                }}>
                                                    {point.momentum > 0 ? '+' : ''}{point.momentum.toFixed(1)}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: '#9ca3af'
                                            }}>
                                                {point.description}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                marginTop: '4px'
                                            }}>
                                                Speaker: {point.speaker}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Live Transcript */}
                <div style={{
                    background: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '12px',
                    padding: '24px'
                }}>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <RadioIcon size={24} color="blue" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                            Live Transcript
                        </h3>
                    </div>

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
                            marginBottom: '24px' // Increased spacing
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
            </div>
    );
};

export default App;