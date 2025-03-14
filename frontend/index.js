import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../frontend/styles.css";

//index
function Index() {
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [esport, setEsport] = useState('');
  const [scholarship, setScholarship] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/colleges')
      .then(response => {
        setColleges(response.data);
        setFilteredColleges(response.data);
      })
      .catch(error => console.log('Error fetching colleges:', error));
  }, []);

  // Filter function
  const handleSearch = () => {
    let filtered = colleges.filter(college => 
      (search === '' || college.name.toLowerCase().includes(search.toLowerCase())) &&
      (region === '' || college.location.toLowerCase().includes(region.toLowerCase())) &&
      (esport === '' || (college.esports_name && college.esports_name.toLowerCase().includes(esport.toLowerCase()))) &&
      (scholarship === '' || college.has_scholarship === (scholarship === 'yes'))
    );
    setFilteredColleges(filtered);
  };

  return (
    <div className="container">
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="#about">About Me</a></li>
          <li><a href="#why">Why Collegiate Esports</a></li>
          <li><a href="/search">Search Colleges</a></li>
          <li><a href="/ai-search">AI Search</a></li>
        </ul>
      </nav>

      <h1>Search for Colleges</h1>

      {/* Search Filters */}
      <div className="filters">
        <input 
          type="text" 
          placeholder="Search by name" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Region" 
          value={region} 
          onChange={(e) => setRegion(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Esports Program" 
          value={esport} 
          onChange={(e) => setEsport(e.target.value)} 
        />
        <select onChange={(e) => setScholarship(e.target.value)}>
          <option value="">Scholarship?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Display Colleges in Grid */}
      <div className="college-grid">
        {filteredColleges.map((college, index) => (
          <div key={index} className="college-card">
            <h2>{college.name}</h2>
            <p><strong>Location:</strong> {college.location}</p>
            <p><strong>Esports Program:</strong> {college.esports_name || 'N/A'}</p>
            <p><strong>Scholarship:</strong> {college.has_scholarship ? 'Available' : 'Not Available'}</p>
            <a href={college.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
          </div>
        ))}
      </div>

      {/* AI Chatbox Placeholder */}
      <div className="chatbox-placeholder">AI Chatbox Coming Soon...</div>
      
    </div>
  );
}

export default Index;
