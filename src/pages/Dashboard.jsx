import { useEffect, useState } from 'react';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaSearch } from 'react-icons/fa';

const COLORS = ['#facc15', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f97316', '#ec4899'];
const GEMINI_API_KEY = 'AIzaSyAhyjfvs6FSDDfKz_sDftb7jVU2awhUFDA';

export default function Dashboard({ darkMode }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [sentimentData, setSentimentData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [onlineMode, setOnlineMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchChartData = async () => {
    try {
      const res = await fetch('http://localhost:5000/chart-data');
      const data = await res.json();
      setSentimentData(Array.isArray(data.sentiments) ? data.sentiments : []);
      setEmotionData(Array.isArray(data.emotions) ? data.emotions : []);
    } catch (err) {
      console.error('Chart data error:', err);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    if (onlineMode) {
      // Use Gemini API
      try {
        const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a sentiment, emotion, and topic classifier.\nClassify this text:\n"${text}"\nReturn only a valid JSON object like this — without comments or explanations:\n{\n  "sentiment": "Positive | Neutral | Negative",\n  "emotion": ["..."], \n  "topic": "..."\n}`
              }]
            }]
          })
        });
        const geminiData = await geminiRes.json();
        // Gemini returns a nested structure, extract the text
        let responseText = '';
        if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content && geminiData.candidates[0].content.parts && geminiData.candidates[0].content.parts[0].text) {
          responseText = geminiData.candidates[0].content.parts[0].text;
        }
        // Try to extract JSON from the response
        let parsed = null;
        try {
          const match = responseText.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          }
        } catch (e) {
          // fallback: not valid JSON
        }
        if (parsed && parsed.sentiment && parsed.emotion && parsed.topic) {
          setResult({ sentiment: parsed.sentiment, emotion: parsed.emotion, topic: parsed.topic });
          // Save to backend for history/charts
          await fetch('http://localhost:5000/save-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              sentiment: parsed.sentiment,
              emotion: parsed.emotion,
              topic: parsed.topic,
              source: 'gemini'
            })
          });
          fetchChartData();
        } else {
          setResult({ sentiment: 'unknown', emotion: 'unknown', topic: 'unknown' });
        }
      } catch (err) {
        setResult({ sentiment: 'error', emotion: 'error', topic: 'error' });
        console.error('Gemini API error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Use local backend (Ollama)
      try {
        const response = await fetch('http://localhost:5000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (!data.error) {
          setResult({ sentiment: data.sentiment, emotion: data.emotion, topic: data.topic });
          fetchChartData();
        }
      } catch (err) {
        console.error('Analyze error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnalyzeBasic = async () => {
    try {
      const response = await fetch('http://localhost:5000/analyze-basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      if (!data.error) {
        setResult({ sentiment: data.sentiment, emotion: data.emotion, topic: data.topic });
        fetchChartData();
      }
    } catch (err) {
      console.error('Basic Analyze error:', err);
    }
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-dark text-white' : ''}`} style={{ borderRadius: '20px', boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }}>
      <div className="mb-3 d-flex align-items-center gap-3">
        <Form.Check
          type="switch"
          id="online-mode-switch"
          label={onlineMode ? 'Online Mode: Gemini API' : 'Offline Mode: Ollama'}
          checked={onlineMode}
          onChange={() => setOnlineMode(v => !v)}
        />
        <span style={{ fontWeight: 500, color: onlineMode ? '#4285F4' : '#6c5ce7' }}>
          {onlineMode ? 'Using Gemini API (Online)' : 'Using Ollama (Local)'}
        </span>
      </div>
      <h3 className="mb-4" style={{ color: darkMode ? '#a29bfe' : '#6c5ce7', fontWeight: '600' }}>FeelScope: Sentiment Analyzer </h3>

      <Form>
        <Form.Group controlId="textInput">
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Write something to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ borderRadius: '15px', padding: '1rem', fontSize: '1rem' }}
            className={darkMode ? 'bg-dark text-white border-secondary' : ''}
          />
        </Form.Group>
        <div className="mt-3 d-flex gap-3">
          <Button 
            style={{ 
              backgroundColor: onlineMode ? '#4285F4' : '#6c5ce7', 
              border: 'none', 
              borderRadius: '15px' 
            }} 
            onClick={handleAnalyze} 
            disabled={loading}
          >
            <FaSearch className="me-2" />
            {loading ? 'Analyzing...' : (onlineMode ? 'Analyze with Gemini ' : 'Analyze with AI ')}
          </Button>
          <Button 
            style={{ 
              backgroundColor: '#a29bfe', 
              border: 'none', 
              borderRadius: '15px' 
            }} 
            onClick={handleAnalyzeBasic}
          >
            <FaSearch className="me-2" /> Basic Analyze 
          </Button>
        </div>
      </Form>

      {result && (
        <Row className="mt-5">
          <Col md={4}>
            <Card className={`text-center p-3 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
              <Card.Title>Sentiment</Card.Title>
              <Card.Text>{result.sentiment}</Card.Text>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`text-center p-3 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
              <Card.Title>Emotion</Card.Title>
              <Card.Text>{result.emotion}</Card.Text>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`text-center p-3 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
              <Card.Title>Topic</Card.Title>
              <Card.Text>{result.topic}</Card.Text>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mt-5">
        <Col md={6}>
          <h5 className={`mb-3 ${darkMode ? 'text-white' : 'text-dark'}`}>Sentiment Chart</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                }
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Col>

        <Col md={6}>
          <h5 className={`mb-3 ${darkMode ? 'text-white' : 'text-dark'}`}>Emotion Chart</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emotionData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                }
              >
                {emotionData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </div>
  );
}
