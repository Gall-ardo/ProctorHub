import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar'; // Import the shared AdminNavBar component
import styles from './AdminSemesterManagement.module.css';

const AdminSemesterManagement = () => {
  const navigate = useNavigate();
  
  // Form states
  const [semesterYear, setSemesterYear] = useState('');
  const [term, setTerm] = useState('');
  
  // Upload states
  const [offeringsFile, setOfferingsFile] = useState(null);
  const [studentsFile, setStudentsFile] = useState(null);
  const [assistantsFile, setAssistantsFile] = useState(null);

  // Term options
  const termOptions = [
    { label: 'Fall', value: 'Fall' },
    { label: 'Spring', value: 'Spring' },
    { label: 'Summer', value: 'Summer' }
  ];

  const handleFileSelect = (fileType, event) => {
    const file = event.target.files[0];
    if (file) {
      switch(fileType) {
        case 'offerings':
          setOfferingsFile(file);
          break;
        case 'students':
          setStudentsFile(file);
          break;
        case 'assistants':
          setAssistantsFile(file);
          break;
        default:
          break;
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (fileType, event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      switch(fileType) {
        case 'offerings':
          setOfferingsFile(file);
          break;
        case 'students':
          setStudentsFile(file);
          break;
        case 'assistants':
          setAssistantsFile(file);
          break;
        default:
          break;
      }
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    console.log('Adding semester:', { 
      semesterYear, 
      term,
      offeringsFile,
      studentsFile,
      assistantsFile
    });
    
    // Add API call here
    // Example: await api.addSemester(formData);
    
    // Reset form or navigate to another page
    // navigate('/admin/semesters');
  };

  return (
    <div className={styles.semesterManagement}>
      {/* Using the shared AdminNavBar component */}
      <AdminNavBar />

      <div className={styles.semesterContent}>
        {/* Semester Information Form */}
        <div className={styles.semesterInfoCard}>
          <h2 className={styles.cardTitle}>Enter Semester Information</h2>
          <form>
            <div className={styles.formGroup}>
              <label>Year</label>
              <input 
                type="text" 
                placeholder="Enter semester year" 
                value={semesterYear}
                onChange={(e) => setSemesterYear(e.target.value)}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Term</label>
              <div className={styles.termOptions}>
                {termOptions.map((termOption) => (
                  <div 
                    key={termOption.value} 
                    className={`${styles.termOption} ${term === termOption.value ? styles.selected : ''}`}
                    onClick={() => setTerm(termOption.value)}
                  >
                    {termOption.label}
                    <span className={styles.radioIndicator}></span>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        
        {/* Upload Cards */}
        <div className={styles.uploadCardsContainer}>
          {/* Offerings Upload Card */}
          <div className={styles.uploadCard}>
            <h3 className={styles.uploadTitle}>Upload Offerings List</h3>
            <div 
              className={styles.uploadArea}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('offerings', e)}
            >
              <div className={styles.uploadIcon}>
                <img src="/upload-icon.png" alt="Upload" />
              </div>
              <div className={styles.uploadText}>Drag and Drop here</div>
              <div className={styles.uploadDivider}>or</div>
              <label className={styles.selectFileBtn}>
                Select file
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  hidden 
                  onChange={(e) => handleFileSelect('offerings', e)}
                />
              </label>
              {offeringsFile && <div className={styles.selectedFile}>{offeringsFile.name}</div>}
            </div>
          </div>
          
          {/* Students Upload Card */}
          <div className={styles.uploadCard}>
            <h3 className={styles.uploadTitle}>Upload Students List</h3>
            <div 
              className={styles.uploadArea}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('students', e)}
            >
              <div className={styles.uploadIcon}>
                <img src="/upload-icon.png" alt="Upload" />
              </div>
              <div className={styles.uploadText}>Drag and Drop here</div>
              <div className={styles.uploadDivider}>or</div>
              <label className={styles.selectFileBtn}>
                Select file
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  hidden 
                  onChange={(e) => handleFileSelect('students', e)}
                />
              </label>
              {studentsFile && <div className={styles.selectedFile}>{studentsFile.name}</div>}
            </div>
          </div>
          
          {/* Teaching Assistants Upload Card */}
          <div className={styles.uploadCard}>
            <h3 className={styles.uploadTitle}>Upload Teaching Assistants List</h3>
            <div 
              className={styles.uploadArea}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('assistants', e)}
            >
              <div className={styles.uploadIcon}>
                <img src="/upload-icon.png" alt="Upload" />
              </div>
              <div className={styles.uploadText}>Drag and Drop here</div>
              <div className={styles.uploadDivider}>or</div>
              <label className={styles.selectFileBtn}>
                Select file
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  hidden 
                  onChange={(e) => handleFileSelect('assistants', e)}
                />
              </label>
              {assistantsFile && <div className={styles.selectedFile}>{assistantsFile.name}</div>}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className={styles.semesterSubmit}>
          <button 
            className={styles.addSemesterBtn}
            onClick={handleFormSubmit}
          >
            Add Semester
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSemesterManagement;