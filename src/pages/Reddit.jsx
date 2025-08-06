// src/pages/Reddit.jsx
import React, { useState } from 'react';
import { Button, Card, Form, Spinner, Badge, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaReddit, FaSearch, FaBrain, FaRocket, FaComments } from 'react-icons/fa';

export default function Reddit({ darkMode }) {
  const [subreddit, setSubreddit] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState([]); // To store sentiment per post

  const fetchPosts = async () => {
    if (!subreddit) return toast.warn("Please enter a subreddit.");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/reddit-search?subreddit=${subreddit}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
        setResults([]); // Reset previous results
        toast.success("Fetched posts successfully");
      } else {
        toast.error("No posts found or error fetching posts.");
      }
    } catch (error) {
      toast.error("Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  const analyzePosts = async () => {
    if (posts.length === 0) return toast.warn("No posts to analyze");

    setAnalyzing(true);
    const newResults = [];
    for (const post of posts) {
      try {
        const res = await fetch('http://localhost:5000/reddit-textblob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: post, source: 'reddit' })
        });

        const analysis = await res.json();
        newResults.push({ text: post, sentiment: analysis.sentiment });
      } catch (error) {
        console.error('Analysis failed for post:', post);
        newResults.push({ text: post, sentiment: 'unknown' });
      }
    }
    setResults(newResults);
    setAnalyzing(false);
    toast.success("Sentiment analysis completed for all posts");
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
        return <Badge bg="dark" className="px-3 py-2">Unknown</Badge>;
    }
  };

  const getSentimentStats = () => {
    const stats = { positive: 0, negative: 0, neutral: 0, unknown: 0 };
    results.forEach(result => {
      const sentiment = result.sentiment.toLowerCase();
      if (stats.hasOwnProperty(sentiment)) {
        stats[sentiment]++;
      } else {
        stats.unknown++;
      }
    });
    return stats;
  };

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <FaReddit style={{ fontSize: '2rem', color: '#ff4500' }} />
        <h2 className={`mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>Reddit Sentiment Analysis</h2>
      </div>

      <Card className={`mb-4 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
        <Card.Body>
          <div className="mb-3">
            <label className={`form-label ${darkMode ? 'text-white' : 'text-dark'}`}>
              <FaSearch className="me-2" />
              Enter Subreddit Name
            </label>
            <Form.Control
              type="text"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              placeholder="e.g., gaming, programming, movies, news..."
              className={`${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
              style={{ borderRadius: '12px', padding: '12px' }}
            />
          </div>

          <div className="d-flex gap-3 flex-wrap">
            <Button
              onClick={fetchPosts}
              disabled={loading || !subreddit}
              style={{
                background: 'linear-gradient(135deg, #ff4500, #ff6b35)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(255, 69, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!loading && subreddit) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 69, 0, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 69, 0, 0.3)';
              }}
            >
              {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <FaRocket className="me-2" />}
              {loading ? 'Fetching Posts...' : 'Fetch Posts'}
            </Button>

            <Button
              onClick={analyzePosts}
              disabled={analyzing || posts.length === 0}
              style={{
                background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!analyzing && posts.length > 0) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(108, 92, 231, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(108, 92, 231, 0.3)';
              }}
            >
              {analyzing ? <Spinner size="sm" animation="border" className="me-2" /> : <FaBrain className="me-2" />}
              {analyzing ? 'Analyzing...' : 'Analyze Sentiment'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {results.length > 0 && (
        <Card className={`mb-4 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
          <Card.Header className={`${darkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="d-flex align-items-center gap-2">
              <FaComments style={{ color: '#6c5ce7' }} />
              <strong>Sentiment Analysis Results</strong>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              {Object.entries(getSentimentStats()).map(([sentiment, count]) => (
                <Col key={sentiment} xs={6} md={3} className="mb-2">
                  <div className="text-center p-2 rounded" style={{
                    background: darkMode ? '#343a40' : '#f8f9fa',
                    border: '1px solid',
                    borderColor: darkMode ? '#6c757d' : '#dee2e6'
                  }}>
                    <div className="fw-bold">{count}</div>
                    <small className="text-capitalize">{sentiment}</small>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {posts.length > 0 && (
        <Card className={darkMode ? 'bg-dark text-white border-secondary' : ''}>
          <Card.Header className={`${darkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="d-flex align-items-center gap-2">
              <FaReddit style={{ color: '#ff4500' }} />
              <strong>Top Posts from r/{subreddit}</strong>
              <Badge bg="primary" className="ms-auto">{posts.length} posts</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {posts.map((post, index) => {
                const result = results.find(r => r.text === post);
                return (
                  <div 
                    key={index} 
                    className={`p-3 rounded mb-3 ${darkMode ? 'bg-dark border border-secondary' : 'bg-light border'}`}
                    style={{
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div className="flex-grow-1">
                        <p className="mb-2" style={{ 
                          fontSize: '0.95rem',
                          color: darkMode ? '#e0e0e0' : '#333'
                        }}>
                          {post.length > 200 ? `${post.substring(0, 200)}...` : post}
                        </p>
                        <small style={{ color: darkMode ? '#6c757d' : '#999' }}>
                          Post #{index + 1}
                        </small>
                      </div>
                      {result && (
                        <div className="flex-shrink-0">
                          {getSentimentBadge(result.sentiment)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card>
      )}

      {posts.length === 0 && !loading && (
        <Card className={`text-center py-5 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
          <Card.Body>
            <FaReddit style={{ fontSize: '4rem', color: '#ff4500', marginBottom: '1rem' }} />
            <h4>No Posts Yet</h4>
            <p className="text-muted">Enter a subreddit name and fetch posts to get started.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
