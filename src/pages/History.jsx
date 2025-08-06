// src/pages/History.jsx
import { useEffect, useState } from 'react';
import { Button, Card, ListGroup, Badge, Row, Col } from 'react-bootstrap';
import { FaHistory, FaTrash, FaClock, FaChartPie, FaHeart, FaBrain } from 'react-icons/fa';

export default function History({ darkMode }) {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/history');
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const clearHistory = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all sentiment history? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const res = await fetch('http://localhost:5000/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
        alert('History successfully cleared.');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <Badge bg="success" className="px-3 py-2">Positive</Badge>;
      case 'negative':
        return <Badge bg="danger" className="px-3 py-2">Negative</Badge>;
      case 'neutral':
        return <Badge bg="secondary" className="px-3 py-2">Neutral</Badge>;
      default:
        return <Badge bg="dark" className="px-3 py-2">{sentiment}</Badge>;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'gemini':
        return <Badge bg="info" className="px-2 py-1">Gemini</Badge>;
      case 'ollama':
        return <Badge bg="warning" className="px-2 py-1">Ollama</Badge>;
      case 'reddit':
        return <Badge bg="primary" className="px-2 py-1">Reddit</Badge>;
      default:
        return <Badge bg="secondary" className="px-2 py-1">{source}</Badge>;
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <FaHistory style={{ fontSize: '2rem', color: darkMode ? '#a29bfe' : '#6c5ce7' }} />
        <h2 className={`mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>Analysis History</h2>
        {history.length > 0 && (
          <Badge bg="primary" className="px-3 py-2">
            {history.length} {history.length === 1 ? 'record' : 'records'}
          </Badge>
        )}
      </div>

      {history.length > 0 ? (
        <>
          <div className="mb-4">
            <Button 
              variant="danger" 
              onClick={clearHistory}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
              }}
            >
              <FaTrash className="me-2" />
              Clear All History
            </Button>
          </div>

          <Row>
            {history.map((item, idx) => (
              <Col key={idx} lg={6} xl={4} className="mb-4">
                <Card 
                  className={`h-100 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                  }}
                >
                  <Card.Header className={`${darkMode ? 'bg-dark border-secondary' : ''}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <FaChartPie style={{ color: darkMode ? '#a29bfe' : '#6c5ce7' }} />
                        <strong>Analysis #{history.length - idx}</strong>
                      </div>
                      {getSourceBadge(item.source)}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Text:</strong>
                      <p className="mt-1 mb-2" style={{ 
                        fontSize: '0.9rem', 
                        color: darkMode ? '#e0e0e0' : '#666',
                        fontStyle: 'italic'
                      }}>
                        {item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaHeart style={{ color: '#ef4444' }} />
                        <strong>Sentiment:</strong>
                      </div>
                      {getSentimentBadge(item.sentiment)}
                    </div>

                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaBrain style={{ color: '#8b5cf6' }} />
                        <strong>Emotion:</strong>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {Array.isArray(item.emotion) ? 
                          item.emotion.map((emotion, i) => (
                            <Badge key={i} bg="info" className="px-2 py-1">{emotion}</Badge>
                          )) : 
                          <Badge bg="info" className="px-2 py-1">{item.emotion}</Badge>
                        }
                      </div>
                    </div>

                    <div className="mb-3">
                      <strong>Topic:</strong>
                      <p className="mt-1 mb-0" style={{ 
                        fontSize: '0.9rem', 
                        color: darkMode ? '#a29bfe' : '#6c5ce7',
                        fontWeight: '500'
                      }}>
                        {item.topic}
                      </p>
                    </div>

                    {item.timestamp && (
                      <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top">
                        <FaClock style={{ color: darkMode ? '#6c757d' : '#999' }} />
                        <small style={{ color: darkMode ? '#6c757d' : '#999' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Card className={`text-center py-5 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
          <Card.Body>
            <FaHistory style={{ fontSize: '4rem', color: darkMode ? '#6c757d' : '#999', marginBottom: '1rem' }} />
            <h4>No History Available</h4>
            <p className="text-muted">Start analyzing text to see your history here.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
